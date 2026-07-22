(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#global-nav");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
    nav.classList.remove("is-open");
  };

  const openMenu = () => {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "メニューを閉じる");
    nav.classList.add("is-open");
  };

  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (event.target.closest(".menu-toggle") || event.target.closest("#global-nav")) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
})();

(() => {
  const form = document.querySelector(".filter-card");
  const compareButton = document.querySelector(".compare-button");
  const resetButton = document.querySelector(".reset-button");
  const comparisonTable = document.querySelector(".comparison-table");
  const comparisonWrap = document.querySelector(".comparison-table-wrap");
  const rankingTitle = document.querySelector("#ranking-detail-title");
  const rankingLead = document.querySelector(".ranking-detail-lead");
  const rankingAudienceLabel = document.querySelector(".ranking-detail-section .section-label.compact strong");
  const comparisonTitle = document.querySelector("#comparison-title");
  const pickupLabel = document.querySelector(".pickup-label");
  const firstView = document.querySelector(".first-view-v3");
  const heroSource = firstView?.querySelector("source[data-personal-srcset]");
  const heroImage = firstView?.querySelector("img[data-personal-src]");
  const initialRankingTitle = rankingTitle?.innerHTML || "";
  const initialRankingLead = rankingLead?.innerHTML || "";
  const initialRankingAudienceLabel = rankingAudienceLabel?.textContent || "";
  const audienceTabs = [...document.querySelectorAll("[data-audience-tab]")];
  const audiencePanels = [...document.querySelectorAll("[data-audience-panel]")];

  if (!form) return;

  const companyProfiles = {
    "ペイトナー": {
      types: ["personal", "freelance"],
      amounts: ["small", "mid"],
      speed: "same-day"
    },
    "ラボル": {
      types: ["personal", "freelance"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "QuQuMo": {
      types: ["corporate"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "メンターキャピタル": {
      types: ["corporate"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "アクセルファクター": {
      types: ["corporate"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "AGビジネスサポート": {
      types: ["corporate", "personal", "freelance"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "ビートレーディング": {
      types: ["corporate"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    }
  };
  companyProfiles.Paytner = companyProfiles["ペイトナー"];
  companyProfiles.labol = companyProfiles["ラボル"];

  const speedRank = {
    "same-day": 0,
    "next-day": 1,
    "two-three-days": 2
  };
  const rankingProfiles = {
    "ペイトナー": companyProfiles["ペイトナー"],
    "ラボル": companyProfiles["ラボル"],
    "QuQuMo": {
      types: ["corporate"],
      amounts: ["small", "mid", "large", "enterprise"],
      speed: "same-day"
    },
    "メンターキャピタル": companyProfiles["メンターキャピタル"],
    "アクセルファクター": companyProfiles["アクセルファクター"],
    "AGビジネスサポート": companyProfiles["AGビジネスサポート"]
  };

  const filterLabels = {
    type: {
      corporate: "法人",
      personal: "個人事業主",
      freelance: "フリーランス"
    },
    amount: {
      small: "〜50万",
      mid: "50〜300万",
      large: "300〜1000万",
      enterprise: "1000万〜"
    },
    speed: {
      "same-day": "即日",
      "next-day": "翌日まで",
      "two-three-days": "2〜3日まで"
    }
  };

  const setActiveAudienceTab = (value) => {
    audienceTabs.forEach((tab) => {
      const active = tab.dataset.audienceTab === value;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  };

  const updateAudiencePanels = (value) => {
    audiencePanels.forEach((panel) => {
      panel.classList.toggle("is-filter-hidden", panel.dataset.audiencePanel !== value);
    });
  };

  const updateHeroImage = (value) => {
    const isCorporate = value === "corporate";
    firstView?.classList.toggle("is-corporate-view", isCorporate);

    if (heroSource) {
      heroSource.srcset = isCorporate
        ? heroSource.dataset.corporateSrcset
        : heroSource.dataset.personalSrcset;
    }

    if (heroImage) {
      heroImage.src = isCorporate
        ? heroImage.dataset.corporateSrc
        : heroImage.dataset.personalSrc;
    }
  };

  const setHeadingLines = (element, lines) => {
    if (!element) return;
    element.replaceChildren();
    lines.forEach((line) => {
      const span = document.createElement("span");
      span.className = "heading-line";
      span.textContent = line;
      element.appendChild(span);
    });
  };

  const setComparisonTitle = (label = "個人事業主") => {
    setHeadingLines(comparisonTitle, [`${label}向け`, "ファクタリング会社", "おすすめTOP3"]);
  };

  const setRankingTitle = () => {
    setHeadingLines(rankingTitle, ["ファクタリング会社", "総合ランキング"]);
  };

  const comparisonRows = comparisonTable
    ? [...comparisonTable.querySelectorAll("tbody tr")]
    : [];
  const rankingCards = [...document.querySelectorAll(".ranking-card")];
  const tableGroups = comparisonTable
    ? [...comparisonTable.querySelectorAll("th.audience")].map((header) => {
        const firstRow = header.closest("tr");
        const rowCount = Number(header.getAttribute("rowspan") || 1);
        const rows = [firstRow];
        let row = firstRow;

        for (let i = 1; i < rowCount; i += 1) {
          row = row?.nextElementSibling;
          if (row) rows.push(row);
        }

        return { header, firstRow, rows };
      })
    : [];

  const getCompanyName = (element) => {
    const name = element.querySelector(".company-cell strong, .ranking-left h3")?.textContent
      .replace(/\s+/g, "")
      .trim() || "";

    return Object.keys(companyProfiles).find((company) => name.startsWith(company));
  };

  const getCriteria = () => ({
    type: form.querySelector('input[name="type"]:checked')?.value,
    amount: form.querySelector('input[name="amount"]:checked')?.value,
    speed: form.querySelector('input[name="speed"]:checked')?.value
  });

  const isMatch = (profile, criteria) => {
    if (!profile || !criteria.type || !criteria.amount || !criteria.speed) return false;

    return (
      profile.types.includes(criteria.type) &&
      profile.amounts.includes(criteria.amount) &&
      speedRank[profile.speed] <= speedRank[criteria.speed]
    );
  };

  const isAudienceMatch = (element, criteria) => {
    const audiences = (element.dataset.audiences || "")
      .split(/\s+/)
      .filter(Boolean);

    return audiences.length === 0 || audiences.includes(criteria.type);
  };

  const getOrCreateStatus = (className, parent, textClass, tagName = "p") => {
    let status = document.querySelector(`.${className}`);

    if (!status && parent) {
      status = document.createElement(tagName);
      status.className = textClass || className;
      status.setAttribute("aria-live", "polite");
      parent.insertAdjacentElement("afterend", status);
    }

    return status;
  };

  const filterStatus = getOrCreateStatus(
    "filter-result-status",
    document.querySelector(".filter-actions"),
    "filter-result-status is-filter-hidden",
    "div"
  );
  const comparisonEmpty = getOrCreateStatus(
    "comparison-empty",
    comparisonWrap,
    "comparison-empty is-filter-hidden"
  );
  const rankingEmpty = getOrCreateStatus(
    "ranking-empty",
    document.querySelector(".ranking-card:last-of-type"),
    "ranking-empty is-filter-hidden"
  );

  const syncRadioGroup = (name) => {
    const radios = [...form.querySelectorAll(`input[type="radio"][name="${name}"]`)];

    radios.forEach((radio) => {
      const option = radio.closest(".filter-option");
      if (!option) return;
      const check = option.querySelector("i");

      option.classList.toggle("is-selected", radio.checked);

      if (radio.checked && !check) {
        const mark = document.createElement("i");
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "✓";
        option.appendChild(mark);
      }

      if (!radio.checked && check) {
        check.remove();
      }
    });
  };

  const updateAudienceHeaders = () => {
    tableGroups.forEach(({ header, firstRow, rows }) => {
      const visibleRows = rows.filter((row) => !row.classList.contains("is-filter-hidden"));
      const targetRow = visibleRows[0] || firstRow;

      if (header.parentElement !== targetRow) {
        targetRow.insertBefore(header, targetRow.firstElementChild);
      }

      header.rowSpan = visibleRows.length || rows.length;
      header.classList.toggle("is-filter-hidden", visibleRows.length === 0);
    });
  };

  const updateRankingCopy = (criteria) => {
    if (!rankingTitle || !rankingLead) return;
    if (rankingAudienceLabel) {
      const audienceLabel = filterLabels.type[criteria.type] || "";
      rankingAudienceLabel.textContent = audienceLabel ? `${audienceLabel}向け` : initialRankingAudienceLabel;
    }

    const label = filterLabels.type[criteria.type] || "条件";
    setRankingTitle();
    rankingLead.textContent = `${label}向けのおすすめサービスを表示しています。`;
    setComparisonTitle(label);
    if (pickupLabel) {
      pickupLabel.textContent = `${label}向け`;
    }
    updateAudiencePanels(criteria.type);
    updateHeroImage(criteria.type);
  };

  const updateFilterStatus = (criteria, count) => {
    if (!filterStatus) return;

    filterStatus.replaceChildren();

    const badge = document.createElement("strong");
    badge.className = "filter-result-badge";
    badge.textContent = "絞り込み中";

    const copy = document.createElement("span");
    copy.className = "filter-result-copy";
    copy.textContent = `${count}社が該当しました`;

    const chips = document.createElement("span");
    chips.className = "filter-result-chips";

    [
      filterLabels.type[criteria.type],
      filterLabels.amount[criteria.amount],
      filterLabels.speed[criteria.speed]
    ].forEach((label) => {
      const chip = document.createElement("span");
      chip.textContent = label;
      chips.appendChild(chip);
    });

    filterStatus.append(badge, copy, chips);
    filterStatus.classList.remove("is-filter-hidden");
  };

  const showAllResults = () => {
    comparisonRows.forEach((row) => {
      row.classList.remove("is-filter-hidden", "is-filter-match");
    });

    rankingCards.forEach((card) => {
      card.classList.remove("is-filter-hidden", "is-filter-match");
    });

    tableGroups.forEach(({ header, firstRow, rows }) => {
      if (header.parentElement !== firstRow) {
        firstRow.insertBefore(header, firstRow.firstElementChild);
      }

      header.rowSpan = rows.length;
      header.classList.remove("is-filter-hidden");
    });

    filterStatus?.classList.add("is-filter-hidden");
    comparisonEmpty?.classList.add("is-filter-hidden");
    rankingEmpty?.classList.add("is-filter-hidden");

    if (rankingTitle) setRankingTitle();
    if (rankingLead) rankingLead.innerHTML = initialRankingLead;
    if (rankingAudienceLabel) rankingAudienceLabel.textContent = initialRankingAudienceLabel;
    setComparisonTitle("個人事業主");
    if (pickupLabel) pickupLabel.textContent = "個人事業主向け";
  };

  const applyFilters = () => {
    const criteria = getCriteria();
    let comparisonCount = 0;
    let rankingCount = 0;

    comparisonRows.forEach((row) => {
      const companyName = getCompanyName(row);
      const matched = isAudienceMatch(row, criteria) && isMatch(companyProfiles[companyName], criteria);

      row.classList.toggle("is-filter-hidden", !matched);
      row.classList.toggle("is-filter-match", matched);
      if (matched) comparisonCount += 1;
    });

    rankingCards.forEach((card) => {
      const companyName = getCompanyName(card);
      const matched = isAudienceMatch(card, criteria) && isMatch(rankingProfiles[companyName], criteria);

      card.classList.toggle("is-filter-hidden", !matched);
      card.classList.toggle("is-filter-match", matched);
      if (matched) rankingCount += 1;
    });

    updateAudienceHeaders();
    updateRankingCopy(criteria);
    updateFilterStatus(criteria, comparisonCount);

    comparisonEmpty?.classList.toggle("is-filter-hidden", comparisonCount !== 0);
    if (comparisonEmpty) {
      comparisonEmpty.textContent = "条件に合う会社が見つかりませんでした。条件を変更して再検索してください。";
    }

    rankingEmpty?.classList.toggle("is-filter-hidden", rankingCount !== 0);
    if (rankingEmpty) {
      rankingEmpty.textContent = "この条件で表示できるランキング詳細はありません。比較表をご確認ください。";
    }
  };

  const syncAll = () => {
    const names = new Set(
      [...form.querySelectorAll('input[type="radio"]')].map((radio) => radio.name)
    );

    names.forEach(syncRadioGroup);
  };

  form.addEventListener("change", (event) => {
    if (event.target.matches('input[type="radio"]')) {
      syncRadioGroup(event.target.name);
      if (event.target.name === "type") {
        setActiveAudienceTab(event.target.value);
      }
      applyFilters();
    }
  });

  audienceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = form.querySelector(`input[name="type"][value="${tab.dataset.audienceTab}"]`);
      if (!target) return;

      target.checked = true;
      syncRadioGroup("type");
      setActiveAudienceTab(target.value);
      applyFilters();
    });
  });

  compareButton?.addEventListener("click", () => {
    applyFilters();
    document.querySelector("#comparison")?.scrollIntoView({ behavior: "smooth" });
  });

  resetButton?.addEventListener("click", () => {
    form.reset();
    syncAll();
    setActiveAudienceTab(getCriteria().type);
    applyFilters();
  });

  const audienceParam = new URLSearchParams(window.location.search).get("audience");
  const pathAudience = /(?:^|\/)ho_1\/?$/i.test(window.location.pathname)
    ? "corporate"
    : /(?:^|\/)ko_1\/?$/i.test(window.location.pathname)
      ? "personal"
      : null;
  const initialAudience = pathAudience || audienceParam;

  if (["corporate", "personal", "freelance"].includes(initialAudience)) {
    const target = form.querySelector(`input[name="type"][value="${initialAudience}"]`);
    if (target) target.checked = true;
  }

  syncAll();
  setActiveAudienceTab(getCriteria().type);
  applyFilters();
})();

(() => {
  const params = new URLSearchParams(window.location.search);
  const clickId = params.get("gclid") || params.get("gbraid") || params.get("wbraid");
  if (!clickId) return;

  document.querySelectorAll('a[href*="jass-net.com/link.php"]').forEach((link) => {
    const rawHref = link.getAttribute("href");
    if (!rawHref) return;

    const url = new URL(rawHref, window.location.href);
    url.searchParams.set("plid", clickId);
    link.href = url.toString();
  });
})();

(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (!window.location.hash) {
    requestAnimationFrame(() => window.scrollTo(0, 0));
    window.addEventListener("load", () => {
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 80);
    }, { once: true });
  }
})();
