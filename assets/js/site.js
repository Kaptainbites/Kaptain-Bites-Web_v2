const SITE_CONFIG = window.KAPTAINBITES_CONFIG || {};
const PRODUCT_CATALOG = Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];
const SITE_PATHS = window.KAPTAINBITES_PATHS || {};
const PRODUCTS_PAGE_URL = SITE_PATHS.shopUrl || "shop.html";
const WHATSAPP_NUMBER = SITE_CONFIG.whatsappNumber || "919535484761";
const SUPPORT_EMAIL = SITE_CONFIG.email || "kaptainbites@gmail.com";
const cartApi = window.KAPTAINBITES_CART || null;
const productQuantities = new Map();

function normalizeSearchQuery(query = "") {
  return query.trim().toLowerCase();
}

function getProductById(productId) {
  return PRODUCT_CATALOG.find((product) => product.id === productId);
}

function getProductThumbnail(product) {
  return product?.thumb || product?.image || "";
}

function getFilteredProducts(query = "") {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return PRODUCT_CATALOG;
  }

  return PRODUCT_CATALOG.filter((product) => {
    const searchableText = [
      product.line,
      product.name,
      product.description,
      product.weight,
      product.notes.join(" "),
      product.searchTerms.join(" ")
    ].join(" ").toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function buildSearchKeywords(query, matches) {
  const normalizedQuery = normalizeSearchQuery(query);
  const keywordPool = new Set();

  matches.forEach((product) => {
    product.searchTerms.forEach((term) => keywordPool.add(term));
  });

  PRODUCT_CATALOG.forEach((product) => {
    product.searchTerms.forEach((term) => keywordPool.add(term));
  });

  return Array.from(keywordPool).filter((term) => {
    if (!normalizedQuery) {
      return true;
    }

    return term.includes(normalizedQuery) || normalizedQuery.includes(term);
  }).slice(0, 6);
}

function buildOrderMessage(product, quantity = 1) {
  const total = product.price * quantity;

  return `Hi, I want to order:\n\nProduct: ${product.name}\nPack Size: ${product.weight}\nQuantity: ${quantity}\nPrice per pack: Rs.${product.price}\nTotal: Rs.${total}\n\nPlease share payment details.`;
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function quickWhatsApp(message = "Hi! I'm interested in ordering KaptainBites snacks. Can you help me?") {
  openWhatsApp(message);
}

function flashButtonFeedback(button, label) {
  if (!button) {
    return;
  }

  const originalLabel = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = originalLabel;
  button.textContent = label;
  button.disabled = true;

  window.setTimeout(() => {
    button.textContent = originalLabel;
    button.disabled = false;
  }, 1200);
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".mobile-toggle");
  const links = document.querySelector(".nav-links");
  const navActions = document.querySelector(".nav-actions");
  const navCart = document.querySelector(".nav-cart");

  if (!toggle || !links || !navActions) {
    return;
  }

  const linkItems = Array.from(links.querySelectorAll("a"))
    .map((link) => ({
      href: link.getAttribute("href") || "#",
      label: link.textContent.trim(),
      active: link.classList.contains("active")
    }))
    .filter((item) => item.label && item.href && item.label.toLowerCase() !== "search");

  const quickLinks = linkItems.filter((item) => item.label.toLowerCase() !== "home");
  const contactLink = linkItems.find((item) => item.label.toLowerCase().includes("contact")) || linkItems[linkItems.length - 1];
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to order KaptainBites snacks.")}`;
  const emailHref = `mailto:${SUPPORT_EMAIL}`;
  const chevronIcon = `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M9 6L15 12L9 18"></path>
    </svg>
  `;

  let overlay = document.querySelector(".mobile-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  let searchButton = navActions.querySelector(".mobile-search-btn");
  if (!searchButton) {
    searchButton = document.createElement("button");
    searchButton.type = "button";
    searchButton.className = "mobile-search-btn";
    searchButton.setAttribute("aria-label", "Search");
    searchButton.setAttribute("aria-expanded", "false");
    searchButton.setAttribute("aria-controls", "mobile-search-sheet");
    searchButton.innerHTML = `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5"></circle>
        <path d="M16 16L21 21"></path>
      </svg>
    `;
    navActions.insertBefore(searchButton, navCart || toggle);
  }

  let menuSheet = document.getElementById("mobile-menu-sheet");
  if (!menuSheet) {
    menuSheet = document.createElement("section");
    menuSheet.id = "mobile-menu-sheet";
    menuSheet.className = "mobile-menu-sheet";
    menuSheet.setAttribute("aria-hidden", "true");
    menuSheet.innerHTML = `
      <div class="mobile-menu-sheet__inner">
        <div class="mobile-menu-sheet__handle" aria-hidden="true"></div>
        <div class="mobile-menu-sheet__body">
          <ul class="mobile-menu-sheet__list">
            ${linkItems.map((item) => `
              <li class="mobile-menu-sheet__item">
                <a href="${item.href}" class="mobile-menu-sheet__link${item.active ? " is-active" : ""}" data-mobile-menu-link>
                  <span>${item.label}</span>
                  ${chevronIcon}
                </a>
              </li>
            `).join("")}
          </ul>
        </div>
        <div class="mobile-menu-sheet__footer">
          <a href="${contactLink?.href || "contact.html"}" class="mobile-menu-sheet__cta" data-mobile-menu-link>Contact Us</a>
          <div class="mobile-menu-sheet__social" aria-label="Quick actions">
            <a href="${emailHref}" aria-label="Email KaptainBites">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M4 7H20V17H4Z"></path>
                <path d="M4 8L12 13L20 8"></path>
              </svg>
            </a>
            <a href="${whatsappHref}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M7 18.5L4.5 19.5L5.5 17C4 15.6 3 13.9 3 12C3 7.6 7 4 12 4C17 4 21 7.6 21 12C21 16.4 17 20 12 20C10.2 20 8.5 19.5 7 18.5Z"></path>
                <path d="M9.5 10.1C9.8 9.5 10.1 9.4 10.4 9.4C10.7 9.4 11 9.4 11.2 10L11.7 11.2C11.9 11.7 11.8 11.9 11.6 12.1L11.2 12.5C11.7 13.6 12.4 14.3 13.5 14.8L13.9 14.4C14.1 14.2 14.3 14.1 14.8 14.3L16 14.8C16.6 15 16.6 15.3 16.6 15.6C16.6 15.9 16.5 16.2 15.9 16.5C15.4 16.8 14.8 16.9 14.4 16.8C12.9 16.5 11.3 15.5 10 14.2C8.7 12.9 7.7 11.3 7.4 9.8C7.3 9.4 7.4 8.8 7.7 8.3C8 7.7 8.3 7.6 8.6 7.6C8.9 7.6 9.2 7.9 9.5 10.1Z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(menuSheet);
  }

  let searchSheet = document.getElementById("mobile-search-sheet");
  if (!searchSheet) {
    const searchLinks = [
      ...quickLinks,
      { href: navCart?.getAttribute("href") || "cart.html", label: "Cart", active: false }
    ].filter((item, index, array) => array.findIndex((entry) => entry.href === item.href) === index);

    searchSheet = document.createElement("section");
    searchSheet.id = "mobile-search-sheet";
    searchSheet.className = "mobile-search-sheet";
    searchSheet.setAttribute("aria-hidden", "true");
    searchSheet.innerHTML = `
      <div class="mobile-search-sheet__inner">
        <div class="mobile-search-sheet__handle" aria-hidden="true"></div>
        <h2 class="mobile-search-sheet__title">Search</h2>
        <form id="mobile-search-form" autocomplete="off" role="search">
          <label class="sr-only" for="mobile-search-input">Search products</label>
          <div class="mobile-search-input-wrap">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5"></circle>
              <path d="M16 16L21 21"></path>
            </svg>
            <input id="mobile-search-input" class="mobile-search-input" type="search" placeholder="Search for ..." enterkeyhint="search">
            <button id="mobile-search-clear" class="mobile-search-clear" type="button" hidden aria-label="Clear search">&times;</button>
          </div>
          <button id="mobile-search-submit" class="mobile-search-sheet__submit" type="submit" hidden>
            <span>Search for "<span id="mobile-search-submit-label"></span>"</span>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M5 12H19"></path>
              <path d="M13 6L19 12L13 18"></path>
            </svg>
          </button>
        </form>
        <div id="mobile-search-results" class="search-sheet-results"></div>
        <div id="mobile-search-links" class="search-sheet-links">
          ${searchLinks.map((item) => `
            <a href="${item.href}" data-mobile-search-link>
              <span>${item.label}</span>
              ${chevronIcon}
            </a>
          `).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(searchSheet);
  }

  const mobileSearchInput = document.getElementById("mobile-search-input");

  function syncSheetState() {
    const anyOpen = menuSheet.classList.contains("active") || searchSheet.classList.contains("active");
    overlay.classList.toggle("active", anyOpen);
    document.body.classList.toggle("mobile-sheet-open", anyOpen);
    menuSheet.setAttribute("aria-hidden", String(!menuSheet.classList.contains("active")));
    searchSheet.setAttribute("aria-hidden", String(!searchSheet.classList.contains("active")));
  }

  function closeNav() {
    toggle.setAttribute("aria-expanded", "false");
    menuSheet.classList.remove("active");
    syncSheetState();
  }

  function closeSearch(options = {}) {
    searchSheet.classList.remove("active");
    searchButton.setAttribute("aria-expanded", "false");
    syncSheetState();

    if (options.focusTrigger) {
      searchButton.focus();
    }
  }

  function openNav() {
    closeSearch();
    menuSheet.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    syncSheetState();
  }

  function openSearch() {
    closeNav();
    searchSheet.classList.add("active");
    searchButton.setAttribute("aria-expanded", "true");
    syncSheetState();
    window.setTimeout(() => mobileSearchInput?.focus({ preventScroll: true }), 120);
  }

  function closeAll() {
    closeNav();
    closeSearch();
  }

  toggle.addEventListener("click", () => {
    if (menuSheet.classList.contains("active")) {
      closeNav();
      return;
    }

    openNav();
  });

  searchButton.addEventListener("click", () => {
    if (searchSheet.classList.contains("active")) {
      closeSearch({ focusTrigger: true });
      return;
    }

    openSearch();
  });

  menuSheet.addEventListener("click", (event) => {
    if (event.target.closest("[data-mobile-menu-link]")) {
      closeAll();
    }
  });

  searchSheet.addEventListener("click", (event) => {
    if (event.target.closest("[data-mobile-search-link]")) {
      closeSearch();
    }
  });

  overlay.addEventListener("click", closeAll);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeAll();
    }
  });

  // ── Swipe-down-to-close for both sheets ──
  function setupSheetDrag(sheet, closeFn) {
    const handle = sheet.querySelector("[class$='__handle']");
    if (!handle) { return; }
    let startY = 0;
    let lastY = 0;
    let dragging = false;

    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      lastY = startY;
      dragging = true;
      sheet.style.transition = "none";
    }, { passive: true });

    handle.addEventListener("touchmove", (e) => {
      if (!dragging) { return; }
      lastY = e.touches[0].clientY;
      const dy = lastY - startY;
      if (dy > 0) { sheet.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });

    handle.addEventListener("touchend", () => {
      if (!dragging) { return; }
      dragging = false;
      sheet.style.transition = "";
      const dy = lastY - startY;
      sheet.style.transform = "";
      if (dy > 80) { closeFn(); }
    });
  }

  setupSheetDrag(menuSheet, closeNav);
  setupSheetDrag(searchSheet, () => closeSearch({ focusTrigger: true }));

  window.KAPTAINBITES_MOBILE_NAV = {
    openSearch,
    closeSearch,
    closeAll
  };
}

function setupMobileSearch() {
  const searchInput = document.getElementById("mobile-search-input");
  const clearBtn = document.getElementById("mobile-search-clear");
  const submitBtn = document.getElementById("mobile-search-submit");
  const submitLabel = document.getElementById("mobile-search-submit-label");
  const resultsEl = document.getElementById("mobile-search-results");
  const linksEl = document.getElementById("mobile-search-links");
  const form = document.getElementById("mobile-search-form");

  if (!searchInput || !resultsEl) {
    return;
  }

  function renderMobileResults(rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    const hasQuery = q.length > 0;

    if (clearBtn) { clearBtn.hidden = !hasQuery; }
    if (submitBtn && submitLabel) {
      submitBtn.hidden = !hasQuery;
      submitLabel.textContent = rawQuery.trim();
    }
    if (linksEl) { linksEl.style.display = hasQuery ? "none" : ""; }

    if (!hasQuery) {
      resultsEl.innerHTML = "";
      return;
    }

    const matches = getFilteredProducts(q).slice(0, 6);
    resultsEl.innerHTML = matches.length
      ? matches.map((p) => `
          <a href="${p.pageUrl}" class="search-sheet-result">
            <img src="${getProductThumbnail(p)}" width="44" height="44" alt="${p.alt}" loading="lazy">
            <span class="search-sheet-result__copy">
              <span class="search-sheet-result__name">${p.name}</span>
              <span class="search-sheet-result__meta">${p.weight} | Rs.${p.price}</span>
            </span>
          </a>`).join("")
      : `<p class="search-sheet-empty">No results for "${rawQuery.trim()}"</p>`;
  }

  searchInput.addEventListener("input", () => renderMobileResults(searchInput.value));

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      renderMobileResults("");
      searchInput.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `${PRODUCTS_PAGE_URL}?q=${encodeURIComponent(q)}`;
      }
    });
  }
}

function buildProductCard(product) {
  const quantity = productQuantities.get(product.id) || 1;

  return `
    <article class="product-card product-card--${product.theme} fade-in" data-product-id="${product.id}">
      <a class="product-img-wrap" href="${product.pageUrl}" aria-label="View ${product.name}">
        <img src="${getProductThumbnail(product)}" alt="${product.alt}" loading="lazy" decoding="async" width="520" height="520">
      </a>
      <div class="product-info">
        <p class="product-line">${product.line}</p>
        <h3 class="product-name"><a href="${product.pageUrl}">${product.name}</a></h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-meta">
          <span>${product.weight}</span>
          <span>No Preservatives</span>
        </div>
        <div class="product-footer">
          <div class="product-price-row">
            <div class="product-price">Rs.${product.price} <span class="product-price__unit">/ pack</span></div>
            ${product.originalPrice ? `<span class="product-price__original">Rs.${product.originalPrice}</span>` : ""}
          </div>
          <div class="product-card__purchase">
            <div class="product-card__controls">
              <div class="quantity-control quantity-control--catalog" aria-label="Select quantity for ${product.name}">
                <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity for ${product.name}">-</button>
                <span class="qty-value" data-qty>${quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity for ${product.name}">+</button>
              </div>
              <button class="product-card__quick cart-btn" type="button" data-add-to-cart="${product.id}">Add to Cart</button>
            </div>
            <button class="product-card__quick product-card__quick--whatsapp order-btn" type="button">Order on WhatsApp</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  document.querySelectorAll("[data-featured-grid]").forEach((grid) => {
    const limit = Number.parseInt(grid.dataset.limit || PRODUCT_CATALOG.length, 10);
    grid.innerHTML = PRODUCT_CATALOG.slice(0, limit).map(buildProductCard).join("");
  });
}

function updateCatalogCounts(visibleCount, query) {
  const productCount = document.getElementById("product-count");

  if (!productCount) {
    return;
  }

  productCount.textContent = query
    ? `${visibleCount} result${visibleCount === 1 ? "" : "s"} found`
    : `${visibleCount} snacks available`;
}

function renderShopCatalog(query = "") {
  const grid = document.getElementById("products-grid");
  const emptyState = document.getElementById("catalog-empty");
  const normalizedQuery = normalizeSearchQuery(query);

  if (!grid) {
    return;
  }

  const filteredProducts = getFilteredProducts(normalizedQuery);
  grid.innerHTML = filteredProducts.map(buildProductCard).join("");
  updateCatalogCounts(filteredProducts.length, normalizedQuery);

  if (emptyState) {
    emptyState.hidden = filteredProducts.length !== 0;
  }
}

function buildSearchProductResult(product) {
  return `
    <button type="button" class="search-result" data-product-id="${product.id}">
      <img src="${getProductThumbnail(product)}" class="search-result__image" alt="${product.alt}" loading="lazy" decoding="async" width="520" height="520">
      <span class="search-result__copy">
        <span class="search-result__name">${product.name}</span>
        <span class="search-result__meta">${product.weight} | Rs.${product.price}</span>
      </span>
    </button>
  `;
}

function setupSearch() {
  const searchForm = document.querySelector(".site-search");
  const searchInput = document.getElementById("product-search");
  const searchClear = document.querySelector(".site-search__clear");
  const searchDropdown = document.getElementById("search-dropdown");
  const searchKeywords = document.getElementById("search-keywords");
  const suggestionsList = document.getElementById("search-suggestions-list");
  const searchViewAll = document.getElementById("search-view-all");
  const mobileSearchForm = document.getElementById("mobile-search-form");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const mobileSearchClear = document.getElementById("mobile-search-clear");
  const mobileSearchSubmit = document.getElementById("mobile-search-submit");
  const mobileSearchSubmitLabel = document.getElementById("mobile-search-submit-label");
  const mobileSearchResults = document.getElementById("mobile-search-results");
  const hasCatalog = Boolean(document.getElementById("products-grid"));
  const hasDesktopSearch = Boolean(searchForm && searchInput && searchDropdown && searchKeywords && suggestionsList && searchViewAll);

  function updateClearButton() {
    if (searchClear && searchInput) {
      searchClear.hidden = searchInput.value.trim().length === 0;
    }
  }

  function hideSuggestions() {
    if (!hasDesktopSearch) {
      return;
    }

    searchDropdown.hidden = true;
    searchKeywords.innerHTML = "";
    suggestionsList.innerHTML = "";
    searchInput.setAttribute("aria-expanded", "false");
  }

  function showCatalogResults(query) {
    const normalizedQuery = normalizeSearchQuery(query);

    if (!hasCatalog) {
      const targetUrl = normalizedQuery
        ? `${PRODUCTS_PAGE_URL}?q=${encodeURIComponent(normalizedQuery)}`
        : PRODUCTS_PAGE_URL;
      window.location.href = targetUrl;
      return;
    }

    renderShopCatalog(normalizedQuery);
    const nextUrl = normalizedQuery
      ? `${window.location.pathname}?q=${encodeURIComponent(normalizedQuery)}`
      : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
    hideSuggestions();

    const grid = document.getElementById("products-grid");
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (window.KAPTAINBITES_MOBILE_NAV && typeof window.KAPTAINBITES_MOBILE_NAV.closeSearch === "function") {
      window.KAPTAINBITES_MOBILE_NAV.closeSearch();
    }
  }

  function renderSuggestions(query) {
    if (!hasDesktopSearch) {
      return;
    }

    const normalizedQuery = normalizeSearchQuery(query);
    updateClearButton();

    if (!normalizedQuery) {
      hideSuggestions();
      if (hasCatalog) {
        renderShopCatalog("");
      }
      return;
    }

    const matches = getFilteredProducts(normalizedQuery).slice(0, 4);
    const keywords = buildSearchKeywords(normalizedQuery, matches);

    searchKeywords.innerHTML = keywords.length
      ? keywords.map((keyword) => `<button type="button" class="search-chip" data-keyword="${keyword}">${keyword}</button>`).join("")
      : `<p class="site-search__empty">No suggestions yet.</p>`;

    suggestionsList.innerHTML = matches.length
      ? matches.map(buildSearchProductResult).join("")
      : `<p class="site-search__empty">No matching snacks found.</p>`;

    searchDropdown.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function buildMobileSearchResult(product) {
    return `
      <a href="${product.pageUrl}" class="search-sheet-result" data-mobile-search-link>
        <img src="${getProductThumbnail(product)}" alt="${product.alt}" loading="lazy" decoding="async" width="88" height="88">
        <span class="search-sheet-result__copy">
          <span class="search-sheet-result__name">${product.name}</span>
          <span class="search-sheet-result__meta">${product.weight} | Rs.${product.price}</span>
        </span>
      </a>
    `;
  }

  function updateMobileSearchUi(query) {
    if (!mobileSearchInput || !mobileSearchResults || !mobileSearchClear || !mobileSearchSubmit || !mobileSearchSubmitLabel) {
      return;
    }

    const normalizedQuery = normalizeSearchQuery(query);
    mobileSearchClear.hidden = normalizedQuery.length === 0;
    mobileSearchSubmit.hidden = normalizedQuery.length === 0;
    mobileSearchSubmitLabel.textContent = query.trim();

    if (!normalizedQuery) {
      mobileSearchResults.innerHTML = "";
      return;
    }

    const matches = getFilteredProducts(normalizedQuery).slice(0, 4);
    mobileSearchResults.innerHTML = matches.length
      ? matches.map(buildMobileSearchResult).join("")
      : `<p class="search-sheet-empty">No matching snacks found.</p>`;
  }

  if (hasDesktopSearch) {
    searchInput.addEventListener("input", () => {
      renderSuggestions(searchInput.value);
      if (hasCatalog) {
        renderShopCatalog(searchInput.value);
      }
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        renderSuggestions(searchInput.value);
      }
    });

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showCatalogResults(searchInput.value);
    });

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        updateClearButton();
        hideSuggestions();
        if (hasCatalog) {
          renderShopCatalog("");
        }
        window.history.replaceState({}, "", window.location.pathname);
        searchInput.focus();
      });
    }

    searchKeywords.addEventListener("click", (event) => {
      const keywordButton = event.target.closest("[data-keyword]");
      if (!keywordButton) {
        return;
      }

      searchInput.value = keywordButton.dataset.keyword;
      renderSuggestions(searchInput.value);
      if (hasCatalog) {
        renderShopCatalog(searchInput.value);
      }
    });

    suggestionsList.addEventListener("click", (event) => {
      const result = event.target.closest("[data-product-id]");
      if (!result) {
        return;
      }

      const product = getProductById(result.dataset.productId);
      if (product) {
        window.location.href = product.pageUrl;
      }
    });

    searchViewAll.addEventListener("click", () => {
      showCatalogResults(searchInput.value);
    });

    document.addEventListener("click", (event) => {
      if (searchForm.contains(event.target) || searchDropdown.contains(event.target)) {
        return;
      }

      hideSuggestions();
    });
  }

  if (mobileSearchInput && mobileSearchForm && mobileSearchClear && mobileSearchSubmit) {
    mobileSearchInput.addEventListener("input", () => {
      updateMobileSearchUi(mobileSearchInput.value);
    });

    mobileSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showCatalogResults(mobileSearchInput.value);
    });

    mobileSearchClear.addEventListener("click", () => {
      mobileSearchInput.value = "";
      updateMobileSearchUi("");
      mobileSearchInput.focus();
    });
  }

  const initialQuery = new URLSearchParams(window.location.search).get("q");
  if (initialQuery) {
    if (searchInput) {
      searchInput.value = initialQuery;
      updateClearButton();
    }
    if (mobileSearchInput) {
      mobileSearchInput.value = initialQuery;
      updateMobileSearchUi(initialQuery);
    }
    if (hasCatalog) {
      renderShopCatalog(initialQuery);
    }
  } else {
    updateClearButton();
    updateMobileSearchUi("");
  }
}


function hasCartSidebar() {
  return Boolean(document.querySelector(".cart-overlay") && document.querySelector(".cart-sidebar"));
}

function setupGlobalActions() {
  document.addEventListener("click", (event) => {
    const quickButton = event.target.closest("[data-quick-whatsapp]");
    if (quickButton) {
      event.preventDefault();
      quickWhatsApp();
      return;
    }

    const productCardButton = event.target.closest(".product-card button");
    if (productCardButton) {
      const productCard = productCardButton.closest(".product-card");
      const productId = productCard?.dataset.productId;
      const product = getProductById(productId);

      if (!productCard || !productId || !product) {
        return;
      }

      if (productCardButton.classList.contains("qty-btn")) {
        const currentQuantity = productQuantities.get(productId) || 1;
        const nextQuantity = productCardButton.dataset.action === "increase"
          ? currentQuantity + 1
          : Math.max(1, currentQuantity - 1);

        productQuantities.set(productId, nextQuantity);
        const quantityValue = productCard.querySelector("[data-qty]");
        if (quantityValue) {
          quantityValue.textContent = String(nextQuantity);
        }
        return;
      }

      if (productCardButton.classList.contains("order-btn")) {
        event.preventDefault();
        openWhatsApp(buildOrderMessage(product, productQuantities.get(productId) || 1));
        return;
      }

      if (productCardButton.classList.contains("cart-btn") && cartApi) {
        cartApi.addCartItem(productId, productQuantities.get(productId) || 1);
        flashButtonFeedback(productCardButton, "Added");
        return;
      }
    }

    const addToCartButton = event.target.closest("[data-add-to-cart]");
    if (addToCartButton && cartApi) {
      const productId = addToCartButton.dataset.addToCart;
      cartApi.addCartItem(productId, 1);
      flashButtonFeedback(addToCartButton, "Added");
    }
  });
}

function setupContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const subjectValue = formData.get("subject");
    const subjectOption = contactForm.querySelector(`[name="subject"] option[value="${subjectValue}"]`);

    const subjectLabel = subjectOption ? subjectOption.textContent.trim() : (subjectValue || "General Enquiry");
    const emailSubject = `KaptainBites Enquiry: ${subjectLabel}`;

    let emailBody = `Hi KaptainBites,\n\nName: ${formData.get("name")}`;

    if (formData.get("email")) {
      emailBody += `\nEmail: ${formData.get("email")}`;
    }

    if (formData.get("phone")) {
      emailBody += `\nPhone: ${formData.get("phone")}`;
    }

    emailBody += `\nSubject: ${subjectLabel}`;
    emailBody += `\n\nMessage:\n${formData.get("message")}`;

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    contactForm.reset();
  });
}

function initFadeAnimations() {
  const fadeItems = document.querySelectorAll(".fade-in");

  if (!fadeItems.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    fadeItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px"
  });

  fadeItems.forEach((item) => observer.observe(item));
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupMobileSearch();
  renderFeaturedProducts();
  renderShopCatalog(new URLSearchParams(window.location.search).get("q") || "");
  setupSearch();
  setupGlobalActions();
  setupContactForm();
  initFadeAnimations();
});

window.quickWhatsApp = quickWhatsApp;
window.KAPTAINBITES_SITE = {
  openWhatsApp,
  buildOrderMessage,
  getProductById
};



