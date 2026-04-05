const PRODUCT_PAGE_CONFIG = window.KAPTAINBITES_CONFIG || {};
const PRODUCT_PAGE_WHATSAPP = PRODUCT_PAGE_CONFIG.whatsappNumber || "917760172150";
const PRODUCT_PAGE_EMAIL = PRODUCT_PAGE_CONFIG.email || "kaptainbites@gmail.com";
const productCartApi = window.KAPTAINBITES_CART || null;
const PRODUCT_PATHS = window.KAPTAINBITES_PATHS || {};
const PRODUCT_LISTING_URL = PRODUCT_PATHS.shopUrl || "../shop.html";

function resolveProductPagePath(path = "") {
  if (!path || /^(?:[a-z]+:|\/\/|#)/i.test(path)) {
    return path;
  }

  return path.startsWith("../") ? path : `../${path}`;
}

function setupProductMobileNavigation() {
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
  const whatsappHref = `https://wa.me/${PRODUCT_PAGE_WHATSAPP}?text=${encodeURIComponent("Hi! I want to order KaptainBites snacks.")}`;
  const emailHref = `mailto:${PRODUCT_PAGE_EMAIL}`;
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
          <a href="${contactLink?.href || "../contact.html"}" class="mobile-menu-sheet__cta" data-mobile-menu-link>Contact Us</a>
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
      { href: navCart?.getAttribute("href") || "../cart.html", label: "Cart", active: false }
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

  window.KAPTAINBITES_MOBILE_NAV = {
    openSearch,
    closeSearch,
    closeAll
  };
}

function getProductCatalog() {
  return Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];
}

function getProductById(productId) {
  return getProductCatalog().find((item) => item.id === productId);
}

function normalizeProductSearchQuery(query = "") {
  return query.trim().toLowerCase();
}

function getFilteredProductCatalog(query = "") {
  const normalizedQuery = normalizeProductSearchQuery(query);

  if (!normalizedQuery) {
    return getProductCatalog();
  }

  return getProductCatalog().filter((product) => {
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

function buildProductSearchKeywords(query, matches) {
  const normalizedQuery = normalizeProductSearchQuery(query);
  const keywordPool = new Set();

  matches.forEach((product) => {
    product.searchTerms.forEach((term) => keywordPool.add(term));
  });

  getProductCatalog().forEach((product) => {
    product.searchTerms.forEach((term) => keywordPool.add(term));
  });

  return Array.from(keywordPool).filter((term) => {
    if (!normalizedQuery) {
      return true;
    }

    return term.includes(normalizedQuery) || normalizedQuery.includes(term);
  }).slice(0, 6);
}

function buildProductSearchResult(product) {
  return `
    <button type="button" class="search-result" data-product-id="${product.id}">
      <img src="${resolveProductPagePath(product.thumb || product.image)}" class="search-result__image" alt="${product.alt}" loading="lazy" decoding="async" width="520" height="520">
      <span class="search-result__copy">
        <span class="search-result__name">${product.name}</span>
        <span class="search-result__meta">${product.weight} | Rs.${product.price}</span>
      </span>
    </button>
  `;
}

function setupProductSearch() {
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

  function viewAllResults(query) {
    const normalizedQuery = normalizeProductSearchQuery(query);
    const targetUrl = normalizedQuery
      ? `${PRODUCT_LISTING_URL}?q=${encodeURIComponent(normalizedQuery)}`
      : PRODUCT_LISTING_URL;
    window.location.href = targetUrl;
  }

  function renderSuggestions(query) {
    if (!hasDesktopSearch) {
      return;
    }

    const normalizedQuery = normalizeProductSearchQuery(query);
    updateClearButton();

    if (!normalizedQuery) {
      hideSuggestions();
      return;
    }

    const matches = getFilteredProductCatalog(normalizedQuery).slice(0, 4);
    const keywords = buildProductSearchKeywords(normalizedQuery, matches);

    searchKeywords.innerHTML = keywords.length
      ? keywords.map((keyword) => `<button type="button" class="search-chip" data-keyword="${keyword}">${keyword}</button>`).join("")
      : `<p class="site-search__empty">No suggestions yet.</p>`;

    suggestionsList.innerHTML = matches.length
      ? matches.map(buildProductSearchResult).join("")
      : `<p class="site-search__empty">No matching snacks found.</p>`;

    searchDropdown.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function buildMobileSearchResult(product) {
    return `
      <a href="${resolveProductPagePath(product.pageUrl)}" class="search-sheet-result" data-mobile-search-link>
        <img src="${resolveProductPagePath(product.thumb || product.image)}" alt="${product.alt}" loading="lazy" decoding="async" width="88" height="88">
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

    const normalizedQuery = normalizeProductSearchQuery(query);
    mobileSearchClear.hidden = normalizedQuery.length === 0;
    mobileSearchSubmit.hidden = normalizedQuery.length === 0;
    mobileSearchSubmitLabel.textContent = query.trim();

    if (!normalizedQuery) {
      mobileSearchResults.innerHTML = "";
      return;
    }

    const matches = getFilteredProductCatalog(normalizedQuery).slice(0, 4);
    mobileSearchResults.innerHTML = matches.length
      ? matches.map(buildMobileSearchResult).join("")
      : `<p class="search-sheet-empty">No matching snacks found.</p>`;
  }

  if (hasDesktopSearch) {
    searchInput.addEventListener("input", () => {
      renderSuggestions(searchInput.value);
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        renderSuggestions(searchInput.value);
      }
    });

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      viewAllResults(searchInput.value);
    });

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        updateClearButton();
        hideSuggestions();
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
    });

    suggestionsList.addEventListener("click", (event) => {
      const result = event.target.closest("[data-product-id]");
      if (!result) {
        return;
      }

      const product = getProductById(result.dataset.productId);
      if (product) {
        window.location.href = resolveProductPagePath(product.pageUrl);
      }
    });

    searchViewAll.addEventListener("click", () => {
      viewAllResults(searchInput.value);
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
      viewAllResults(mobileSearchInput.value);
    });

    mobileSearchClear.addEventListener("click", () => {
      mobileSearchInput.value = "";
      updateMobileSearchUi("");
      mobileSearchInput.focus();
    });
  }

  updateClearButton();
  updateMobileSearchUi("");
}

function buildProductOrderMessage(product, quantity) {
  const total = product.price * quantity;

  return `Hi, I want to order:\n\nProduct: ${product.name}\nPack Size: ${product.weight}\nQuantity: ${quantity}\nPrice per pack: Rs.${product.price}\nTotal: Rs.${total}\n\nPlease share payment details.`;
}

function openProductWhatsApp(message) {
  const url = `https://wa.me/${PRODUCT_PAGE_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function flashProductButton(button, label) {
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

function buildRelatedProductCard(product) {
  return `
    <a class="related-product-card" href="${resolveProductPagePath(product.pageUrl)}">
      <span class="related-product-card__media">
        <img src="${resolveProductPagePath(product.thumb || product.image)}" alt="${product.alt}" loading="lazy" decoding="async" width="520" height="520">
      </span>
      <span class="related-product-card__copy">
        <span class="related-product-card__eyebrow">${product.line}</span>
        <span class="related-product-card__title">${product.name}</span>
        <span class="related-product-card__price">Rs.${product.price} <span>/ pack</span></span>
      </span>
    </a>
  `;
}

function renderProductDetail() {
  const productId = document.body.dataset.productId;
  const catalog = getProductCatalog();
  const product = catalog.find((item) => item.id === productId);
  const container = document.getElementById("product-detail");

  if (!container) {
    return;
  }

  if (!product) {
    container.innerHTML = `
      <article class="product-detail-card fade-in visible">
        <div class="product-detail__content">
          <span class="tag">Unavailable</span>
          <h1>Product not found</h1>
          <p>The snack you are looking for could not be loaded.</p>
          <a class="btn-secondary" href="${PRODUCT_LISTING_URL}">Back to Shop</a>
        </div>
      </article>
    `;
    return;
  }

  document.title = `${product.name} | KaptainBites`;
  const relatedProducts = catalog.filter((item) => item.id !== product.id).slice(0, 3);

  container.innerHTML = `
    <article class="product-detail-card product-detail-card--${product.theme} fade-in visible">
      <div class="product-detail__media">
        <img src="${resolveProductPagePath(product.image)}" alt="${product.alt}" decoding="async" fetchpriority="high" width="880" height="880">
      </div>
      <div class="product-detail__content">
        <p class="product-detail__line">${product.line}</p>
        <h1>${product.name}</h1>
        <div class="product-detail__meta">
          <span>${product.weight}</span>
          <span>No Preservatives</span>
          <span>Premium Roasted Nuts</span>
        </div>
        <div class="product-detail__price">
          <strong>Rs.${product.price}</strong>
          <span>/ pack</span>
          ${product.originalPrice ? `<s>Rs.${product.originalPrice}</s>` : ""}
        </div>
        <p class="product-detail__description">${product.description}</p>
        <ul class="product-detail__notes">
          ${product.notes.map((note) => `<li>${note}</li>`).join("")}
        </ul>
        <div class="product-detail__order">
          <div class="quantity-control quantity-control--detail" aria-label="Select quantity for ${product.name}">
            <button type="button" class="qty-btn" data-action="decrease">-</button>
            <span class="qty-value" data-qty>1</span>
            <button type="button" class="qty-btn" data-action="increase">+</button>
          </div>
          <div class="product-detail__order-actions">
            <button type="button" class="btn-secondary" data-product-cart>Add to Cart</button>
            <button type="button" class="btn-primary" data-product-order>Order on WhatsApp</button>
          </div>
        </div>
        <a class="product-detail__back" href="${PRODUCT_LISTING_URL}">Back to Shop</a>
      </div>
    </article>
    ${relatedProducts.length ? `
      <section class="related-products fade-in visible">
        <div class="section-header product-detail-section-header">
          <span class="tag">More Flavors</span>
          <h2>Explore More Snacks</h2>
        </div>
        <div class="related-products__grid">
          ${relatedProducts.map(buildRelatedProductCard).join("")}
        </div>
      </section>
    ` : ""}
  `;

  let quantity = 1;
  const quantityNode = container.querySelector("[data-qty]");
  const orderButton = container.querySelector("[data-product-order]");
  const cartButton = container.querySelector("[data-product-cart]");

  container.addEventListener("click", (event) => {
    const quantityButton = event.target.closest(".qty-btn");
    if (!quantityButton) {
      return;
    }

    if (quantityButton.dataset.action === "increase") {
      quantity += 1;
    }

    if (quantityButton.dataset.action === "decrease" && quantity > 1) {
      quantity -= 1;
    }

    if (quantityNode) {
      quantityNode.textContent = String(quantity);
    }
  });

  orderButton?.addEventListener("click", () => {
    openProductWhatsApp(buildProductOrderMessage(product, quantity));
  });

  cartButton?.addEventListener("click", () => {
    if (!productCartApi) {
      return;
    }

    productCartApi.addCartItem(product.id, quantity);
    flashProductButton(cartButton, "Added");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupProductMobileNavigation();
  setupProductSearch();
  renderProductDetail();
});







