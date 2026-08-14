(() => {
  const filterSection = document.querySelector(".filter-section");
  const columnSection = document.querySelector(".column-section");

  if (!filterSection || !columnSection) return;

  const desktopPosition = document.createComment("filter desktop position");
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  filterSection.before(desktopPosition);

  const updateFilterPosition = (event) => {
    const isMobile = event.matches;

    filterSection.classList.toggle("is-mobile-column-filter", isMobile);

    if (isMobile) {
      columnSection.before(filterSection);
    } else {
      desktopPosition.after(filterSection);
    }
  };

  updateFilterPosition(mobileQuery);
  mobileQuery.addEventListener("change", updateFilterPosition);
})();
