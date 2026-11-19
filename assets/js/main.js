(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  /* ---------- Aviso flotante ---------- */
  const toast = $('#toast');
  const toastText = $('#toast-text');
  let toastTimer;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3400);
  }

  /* ---------- Header ---------- */
  const header = $('#header');
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Año del footer ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Bloqueo de scroll ---------- */
  const menu = $('#mobile-menu');
  const searchOverlay = $('#search-overlay');

  function syncScrollLock() {
    const menuOpen = menu && menu.classList.contains('is-open');
    const searchOpen = searchOverlay && searchOverlay.classList.contains('is-open');
    body.classList.toggle('is-locked', Boolean(menuOpen || searchOpen));
  }

  /* ---------- Menú móvil ---------- */
  const menuOpenBtn = $('#menu-open');
  const menuCloseBtn = $('#menu-close');
  let menuTrigger = null;

  function openMenu() {
    if (!menu) return;
    closeSearch(false);
    menuTrigger = document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    if (menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'true');
    syncScrollLock();
    setTimeout(() => menuCloseBtn && menuCloseBtn.focus(), 90);
  }

  function closeMenu(restoreFocus = true) {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'false');
    syncScrollLock();
    if (restoreFocus && menuTrigger) menuTrigger.focus();
  }

  if (menuOpenBtn) menuOpenBtn.addEventListener('click', openMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', () => closeMenu());

  $$('.mobile-menu__nav a, .mobile-menu .brand, .mobile-menu__foot a').forEach((link) => {
    link.addEventListener('click', () => closeMenu(false));
  });

  /* ---------- Buscador ---------- */
  const searchOpenBtn = $('#search-open');
  const searchCloseBtn = $('#search-close');
  const searchInput = $('#search-input');
  const searchForm = $('#search-form');
  let searchTrigger = null;

  function openSearch() {
    if (!searchOverlay) return;
    closeMenu(false);
    searchTrigger = document.activeElement;
    searchOverlay.classList.add('is-open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    syncScrollLock();
    setTimeout(() => searchInput && searchInput.focus(), 90);
  }

  function closeSearch(restoreFocus = true) {
    if (!searchOverlay || !searchOverlay.classList.contains('is-open')) return;
    searchOverlay.classList.remove('is-open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (restoreFocus && searchTrigger) searchTrigger.focus();
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', () => closeSearch());

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (event) => {
      if (event.target === searchOverlay) closeSearch();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (searchOverlay && searchOverlay.classList.contains('is-open')) {
      closeSearch();
    } else if (menu && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ---------- Productos, filtros y búsqueda ---------- */
  const productGrid = $('#product-grid');
  const productCards = productGrid ? $$('.product-card', productGrid) : [];
  const filterButtons = $$('.filter-btn');
  const filterStatus = $('#filter-status');
  const filterStatusText = $('#filter-status-text');
  const filterClear = $('#filter-clear');
  const productsEmpty = $('#products-empty');
  const emptyClear = $('#empty-clear');
  const filterLabels = { all: 'Todas', oro: 'Oro', plata: 'Plata', nativa: 'Edición Nativa' };
  const productState = { filter: 'all', query: '' };

  const normalize = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  function cardSearchText(card) {
    const material = $('.product-card__material', card);
    return normalize([
      card.dataset.name || '',
      card.dataset.material || '',
      material ? material.textContent : ''
    ].join(' '));
  }

  function renderProducts() {
    if (!productCards.length) return;

    const query = normalize(productState.query.trim());
    let visible = 0;

    productCards.forEach((card) => {
      const materials = (card.dataset.material || '').split(/\s+/);
      const matchesFilter = productState.filter === 'all' || materials.includes(productState.filter);
      const matchesQuery = !query || cardSearchText(card).includes(query);
      const show = matchesFilter && matchesQuery;

      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === productState.filter && !query;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (productsEmpty) productsEmpty.hidden = visible !== 0;

    if (!filterStatus || !filterStatusText) return;
    const spelledQuery = productState.query.trim();

    if (spelledQuery) {
      filterStatus.hidden = false;
      filterStatusText.textContent = `${visible} ${visible === 1 ? 'pieza' : 'piezas'} para “${spelledQuery}”`;
    } else if (productState.filter !== 'all') {
      filterStatus.hidden = false;
      filterStatusText.textContent = `Mostrando ${visible} ${visible === 1 ? 'pieza' : 'piezas'} · ${filterLabels[productState.filter] || ''}`;
    } else {
      filterStatus.hidden = true;
      filterStatusText.textContent = '';
    }
  }

  function resetProducts() {
    productState.filter = 'all';
    productState.query = '';
    if (searchInput) searchInput.value = '';
    renderProducts();
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      productState.filter = button.dataset.filter || 'all';
      productState.query = '';
      if (searchInput) searchInput.value = '';
      renderProducts();
    });
  });

  $$('a[data-filter]').forEach((link) => {
    link.addEventListener('click', () => {
      productState.filter = link.dataset.filter || 'all';
      productState.query = '';
      if (searchInput) searchInput.value = '';
      renderProducts();
    });
  });

  if (filterClear) filterClear.addEventListener('click', resetProducts);
  if (emptyClear) emptyClear.addEventListener('click', resetProducts);

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput ? searchInput.value.trim() : '';
      if (!query) {
        if (searchInput) searchInput.focus();
        return;
      }

      productState.query = query;
      productState.filter = 'all';
      renderProducts();
      closeSearch(false);
      showToast(`Buscando “${query}” en la colección`);

      const section = $('#piezas');
      if (section) {
        setTimeout(() => section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }), 120);
      }
    });
  }

  $$('.search-tags [data-search]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!searchInput || !searchForm) return;
      searchInput.value = button.dataset.search || '';
      if (typeof searchForm.requestSubmit === 'function') {
        searchForm.requestSubmit();
      } else {
        searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  });

  renderProducts();

  /* ---------- Bolsa de compra ---------- */
  const bagButton = $('#bag-button');
  const bagCount = $('#bag-count');
  const cartDrawer = $('#cart-drawer');
  const cartList = $('#cart-list');
  const cartEmpty = $('#cart-empty');
  const cartFoot = $('#cart-foot');
  const cartTotalEl = $('#cart-total');
  const cartUnitsEl = $('#cart-units');
  const cartCloseBtn = $('#cart-close');
  const cartCheckoutBtn = $('#cart-checkout');
  const cartClearBtn = $('#cart-clear');
  const cartShopBtn = $('#cart-shop');
  const checkoutModal = $('#checkout-modal');
  const checkoutForm = $('#checkout-form');
  const checkoutCloseBtn = $('#checkout-close');
  const checkoutSummary = $('#checkout-summary');
  const CART_KEY = 'nativa-bolsa-v1';
  const CART_MAX_QTY = 9;
  let cartTrigger = null;

  /* Toma el primer precio del texto; en rangos («$ 800.000 - $ 1.100.000») usa el menor. */
  const parsePrice = (text) => {
    const match = String(text || '').match(/\d[\d.]*(?:,\d+)?/);
    if (!match) return 0;
    const clean = match[0].replace(/\./g, '').replace(',', '.');
    const value = parseFloat(clean);
    return Number.isFinite(value) ? value : 0;
  };
  const isFromPrice = (text) => /\d\s*[-–~]|~/.test(String(text || ''));

  const formatPrice = (value) => {
    let text;
    try {
      text = value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
    } catch (error) {
      text = String(value);
    }
    return `$ ${text}`;
  };

  /* Catálogo leído de las tarjetas que tienen botón «Añadir a la bolsa» */
  const catalog = new Map();
  $$('[data-add]').forEach((button) => {
    const card = button.closest('.product-card, .catalog__item');
    if (!card) return;
    const name = button.dataset.add;
    const img = $('img', card);
    const material = $('.product-card__material', card);
    const catMat = $('.catalog__mat', card);
    const price = $('.product-card__price', card);
    const priceText = price ? price.textContent : '';
    let materialText = '';
    if (material) {
      materialText = material.textContent.trim();
    } else if (catMat) {
      materialText = catMat.firstChild ? catMat.firstChild.textContent.trim() : '';
    }
    catalog.set(name, {
      name,
      price: parsePrice(priceText),
      from: isFromPrice(priceText),
      img: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') || '' : '',
      material: materialText
    });
  });

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((item) => item && catalog.has(item.name))
        .map((item) => ({
          name: item.name,
          qty: Math.min(CART_MAX_QTY, Math.max(1, parseInt(item.qty, 10) || 1))
        }));
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      /* Sin almacenamiento disponible: la bolsa funciona igual durante la visita. */
    }
  }

  let cartItems = loadCart();

  const cartUnits = () => cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = () => cartItems.reduce((sum, item) => sum + item.qty * catalog.get(item.name).price, 0);
  const cartHasFrom = () => cartItems.some((item) => catalog.get(item.name).from);
  const pieces = (n) => `${n} ${n === 1 ? 'pieza' : 'piezas'}`;

  function makeEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function actionButton(action, name, label, text, extraClass) {
    const button = makeEl('button', extraClass, text);
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.name = name;
    button.setAttribute('aria-label', label);
    return button;
  }

  function renderCart() {
    const units = cartUnits();
    const active = document.activeElement;
    const focusKey = active && cartList && cartList.contains(active)
      ? `${active.dataset.action}|${active.dataset.name}`
      : null;

    if (bagCount) {
      bagCount.hidden = units === 0;
      bagCount.textContent = String(units);
    }
    if (bagButton) {
      bagButton.setAttribute('aria-label', units ? `Ver mi bolsa, ${pieces(units)}` : 'Ver mi bolsa');
    }
    if (!cartList) return;

    cartList.replaceChildren();

    cartItems.forEach((item) => {
      const info = catalog.get(item.name);
      const row = makeEl('li', 'cart-item');

      const thumb = makeEl('img', 'cart-item__img');
      thumb.src = info.img;
      thumb.alt = info.alt;
      thumb.width = 72;
      thumb.height = 90;
      row.appendChild(thumb);

      const details = makeEl('div', 'cart-item__info');
      details.appendChild(makeEl('h3', '', info.name));
      details.appendChild(makeEl('p', 'cart-item__material', info.material));
      details.appendChild(makeEl('p', 'cart-item__unit', `${info.from ? 'desde ' : ''}${formatPrice(info.price)} c/u`));

      const qty = makeEl('div', 'cart-qty');
      const minus = actionButton('dec', info.name, `Quitar una unidad de ${info.name}`, '−');
      minus.disabled = item.qty <= 1;
      const value = makeEl('span', 'cart-qty__value', String(item.qty));
      value.setAttribute('aria-label', `${item.qty} unidades`);
      const plus = actionButton('inc', info.name, `Añadir una unidad de ${info.name}`, '+');
      plus.disabled = item.qty >= CART_MAX_QTY;
      qty.append(minus, value, plus);
      details.appendChild(qty);
      row.appendChild(details);

      const side = makeEl('div', 'cart-item__side');
      side.appendChild(makeEl('p', 'cart-item__line', `${info.from ? 'desde ' : ''}${formatPrice(item.qty * info.price)}`));
      side.appendChild(actionButton('remove', info.name, `Quitar ${info.name} de la bolsa`, 'Quitar', 'cart-item__remove'));
      row.appendChild(side);

      cartList.appendChild(row);
    });

    const hasItems = units > 0;
    if (cartEmpty) cartEmpty.hidden = hasItems;
    if (cartFoot) cartFoot.hidden = !hasItems;
    if (cartUnitsEl) cartUnitsEl.textContent = hasItems ? `· ${pieces(units)}` : '';
    if (cartTotalEl) cartTotalEl.textContent = `${cartHasFrom() ? 'desde ' : ''}${formatPrice(cartTotal())}`;

    if (focusKey && cartDrawer && cartDrawer.classList.contains('is-open')) {
      const [action, name] = focusKey.split('|');
      const again = $$('[data-action]', cartList).find((node) => (
        node.dataset.action === action && node.dataset.name === name && !node.disabled
      ));
      const fallback = $$('[data-action]', cartList).find((node) => node.dataset.name === name && !node.disabled);
      const target = again || fallback || (hasItems ? cartCheckoutBtn : cartShopBtn);
      if (target) target.focus();
    }
  }

  function addToCart(name) {
    const info = catalog.get(name);
    if (!info) return;
    const existing = cartItems.find((item) => item.name === name);

    if (existing && existing.qty >= CART_MAX_QTY) {
      showToast(`Máximo ${CART_MAX_QTY} unidades de ${name} por pedido.`);
      return;
    }

    if (existing) {
      existing.qty += 1;
    } else {
      cartItems.push({ name, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast(`${name} se añadió a tu bolsa.`);
    if (bagButton && typeof bagButton.animate === 'function') {
      bagButton.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'ease-out' }
      );
    }
  }

  function changeQty(name, delta) {
    const item = cartItems.find((entry) => entry.name === name);
    if (!item) return;
    const next = item.qty + delta;
    if (next < 1) return;
    if (next > CART_MAX_QTY) {
      showToast(`Máximo ${CART_MAX_QTY} unidades de ${name} por pedido.`);
      return;
    }
    item.qty = next;
    saveCart();
    renderCart();
  }

  function removeFromCart(name) {
    cartItems = cartItems.filter((item) => item.name !== name);
    saveCart();
    renderCart();
    showToast(`${name} se quitó de tu bolsa.`);
  }

  function openCart() {
    if (!cartDrawer) return;
    closeMenu(false);
    closeSearch(false);
    cartTrigger = document.activeElement;
    renderCart();
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    const bodyEl = $('#cart-body');
    if (bodyEl) bodyEl.scrollTop = 0;
    setTimeout(() => cartCloseBtn && cartCloseBtn.focus(), 90);
  }

  function closeCart(restoreFocus = true) {
    if (!cartDrawer || !cartDrawer.classList.contains('is-open')) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (restoreFocus && cartTrigger) cartTrigger.focus();
  }

  $$('[data-add]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.add));
    /* Las piezas del catálogo son role="button" sobre un div: activar con Enter o Espacio */
    if (button.tagName !== 'BUTTON') {
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          addToCart(button.dataset.add);
        }
      });
    }
  });

  if (bagButton) {
    bagButton.setAttribute('aria-haspopup', 'dialog');
    bagButton.addEventListener('click', openCart);
  }

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => closeCart());

  if (cartList) {
    cartList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;
      const name = button.dataset.name;
      if (button.dataset.action === 'inc') changeQty(name, 1);
      if (button.dataset.action === 'dec') changeQty(name, -1);
      if (button.dataset.action === 'remove') removeFromCart(name);
    });
  }

  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', () => {
      cartItems = [];
      saveCart();
      renderCart();
      showToast('Tu bolsa quedó vacía.');
      if (cartShopBtn) cartShopBtn.focus();
    });
  }

  if (cartShopBtn) {
    cartShopBtn.addEventListener('click', () => {
      closeCart(false);
      const section = $('#piezas');
      if (section) {
        setTimeout(() => section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }), 120);
      }
    });
  }

  /* ---------- Datos del cliente y envío por WhatsApp ---------- */
  let checkoutTrigger = null;

  function openCheckout() {
    if (!checkoutModal || !cartItems.length) return;
    checkoutTrigger = document.activeElement;
    if (checkoutSummary) {
      checkoutSummary.textContent = `${pieces(cartUnits())} · Total ${cartHasFrom() ? 'desde ' : ''}${formatPrice(cartTotal())}`;
    }
    checkoutModal.classList.add('is-open');
    checkoutModal.setAttribute('aria-hidden', 'false');
    const first = $('#checkout-name');
    setTimeout(() => first && first.focus(), 90);
  }

  function closeCheckout(restoreFocus = true) {
    if (!checkoutModal || !checkoutModal.classList.contains('is-open')) return;
    checkoutModal.classList.remove('is-open');
    checkoutModal.setAttribute('aria-hidden', 'true');
    if (restoreFocus && checkoutTrigger) checkoutTrigger.focus();
  }

  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (!cartItems.length) return;
      openCheckout();
    });
  }

  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', () => closeCheckout());

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (event) => {
      if (event.target === checkoutModal) closeCheckout();
    });

    document.addEventListener('keydown', (event) => {
      if (!checkoutModal.classList.contains('is-open')) return;

      /* Este modal va encima de la bolsa: sus teclas no deben llegar al panel de la bolsa. */
      event.stopImmediatePropagation();

      if (event.key === 'Escape') {
        closeCheckout();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = $$('input, button:not([disabled])', checkoutModal)
        .filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  if (checkoutForm) {
    const nameField = $('#checkout-name');
    const lastNameField = $('#checkout-lastname');
    const emailField = $('#checkout-email');
    const requiredFields = [nameField, lastNameField, emailField].filter(Boolean);

    requiredFields.forEach((field) => {
      field.addEventListener('input', () => field.setCustomValidity(''));
    });

    checkoutForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!cartItems.length) {
        closeCheckout(false);
        return;
      }

      requiredFields.forEach((field) => {
        field.setCustomValidity(field.value.trim() ? '' : 'Completa este campo.');
      });

      if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
      }

      const form = $('#contact-form');
      const number = form ? (form.dataset.whatsapp || '').replace(/\D/g, '') : '';
      if (!number) {
        showToast('No pudimos abrir WhatsApp. Escríbenos desde la sección de contacto.');
        return;
      }

      /* El correo se pide para validar el pedido, pero no se incluye en el mensaje. */
      const fullName = `${nameField.value.trim()} ${lastNameField.value.trim()}`.trim();
      const lines = [`Hola Nativa, soy ${fullName} y quiero hacer este pedido:`, ''];
      cartItems.forEach((item) => {
        const info = catalog.get(item.name);
        lines.push(`• ${item.qty} × ${info.name} — ${info.from ? 'desde ' : ''}${formatPrice(item.qty * info.price)}`);
      });
      lines.push('', `Total: ${cartHasFrom() ? 'desde ' : ''}${formatPrice(cartTotal())} USD`, '', '¿Me confirman disponibilidad, envío y forma de pago? ¡Gracias!');

      const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
      showToast('Abriendo WhatsApp con tu pedido…');
      closeCheckout(false);

      const whatsappWindow = window.open(url, '_blank');
      if (whatsappWindow) {
        whatsappWindow.opener = null;
      } else {
        window.location.href = url;
      }
    });
  }

  if (cartDrawer) {
    cartDrawer.addEventListener('click', (event) => {
      if (event.target === cartDrawer) closeCart();
    });

    document.addEventListener('keydown', (event) => {
      if (!cartDrawer.classList.contains('is-open')) return;
      if (checkoutModal && checkoutModal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeCart();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = $$('a[href], button:not([disabled]):not([hidden])', cartDrawer)
        .filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  renderCart();

  /* ---------- Favoritos ---------- */
  $$('.wish').forEach((button) => {
    button.addEventListener('click', () => {
      const isPressed = button.getAttribute('aria-pressed') === 'true';
      const product = button.dataset.product || 'esta pieza';

      button.setAttribute('aria-pressed', String(!isPressed));
      button.setAttribute(
        'aria-label',
        isPressed ? `Guardar ${product} en favoritos` : `Quitar ${product} de favoritos`
      );
      showToast(
        isPressed
          ? `${product} se quitó de favoritos.`
          : `${product} se guardó en favoritos.`
      );
    });
  });

  /* ---------- Contacto por WhatsApp ---------- */
  const contactForm = $('#contact-form');
  const whatsappNumber = contactForm
    ? (contactForm.dataset.whatsapp || '').replace(/\D/g, '')
    : '';

  if (whatsappNumber) {
    $$('[data-whatsapp-link]').forEach((link) => {
      link.href = `https://wa.me/${whatsappNumber}`;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  if (contactForm) {
    const nameField = $('#contact-name');
    const lastNameField = $('#contact-lastname');
    const emailField = $('#contact-email');
    const messageField = $('#contact-message');

    if (nameField && lastNameField && emailField) {
      const requiredFields = [nameField, lastNameField, emailField];

      requiredFields.forEach((field) => {
        field.addEventListener('input', () => field.setCustomValidity(''));
      });

      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        requiredFields.forEach((field) => {
          field.setCustomValidity(field.value.trim() ? '' : 'Completa este campo.');
        });

        if (!contactForm.checkValidity()) {
          contactForm.reportValidity();
          return;
        }

        const fullName = `${nameField.value.trim()} ${lastNameField.value.trim()}`.trim();
        const email = emailField.value.trim();
        const message = messageField ? messageField.value.trim() : '';
        const lines = [
          `Hola Nativa, soy ${fullName}.`,
          `Mi correo es ${email}.`
        ];

        if (message) lines.push('', message);

        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
        showToast('Abriendo WhatsApp con tu mensaje…');

        const whatsappWindow = window.open(url, '_blank');
        if (whatsappWindow) {
          whatsappWindow.opener = null;
        } else {
          window.location.href = url;
        }
      });
    }
  }

  /* ---------- Ventana de Políticas de Privacidad ---------- */
  const privacyModal = $('#privacy-modal');
  const privacyOpenLinks = $$('#privacy-open');
  const privacyCloseBtn = $('#privacy-close');
  const privacyAcceptBtn = $('#privacy-accept');
  let privacyTrigger = null;

  function openPrivacy(event) {
    if (!privacyModal) return;
    if (event) event.preventDefault();
    closeMenu(false);
    closeSearch(false);
    privacyTrigger = document.activeElement;
    privacyModal.classList.add('is-open');
    privacyModal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    const bodyEl = $('#privacy-body');
    if (bodyEl) bodyEl.scrollTop = 0;
    setTimeout(() => privacyCloseBtn && privacyCloseBtn.focus(), 90);
  }

  function closePrivacy(restoreFocus = true) {
    if (!privacyModal || !privacyModal.classList.contains('is-open')) return;
    privacyModal.classList.remove('is-open');
    privacyModal.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (restoreFocus && privacyTrigger) privacyTrigger.focus();
  }

  privacyOpenLinks.forEach((link) => link.addEventListener('click', openPrivacy));
  if (privacyCloseBtn) privacyCloseBtn.addEventListener('click', () => closePrivacy());
  if (privacyAcceptBtn) privacyAcceptBtn.addEventListener('click', () => closePrivacy());

  if (privacyModal) {
    privacyModal.addEventListener('click', (event) => {
      if (event.target === privacyModal) closePrivacy();
    });

    document.addEventListener('keydown', (event) => {
      if (!privacyModal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closePrivacy();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = $$('a[href], button:not([disabled]), [tabindex="0"]', privacyModal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Ventana de Términos y Condiciones ---------- */
  const termsModal = $('#terms-modal');
  const termsOpenLink = $('#terms-open');
  const termsCloseBtn = $('#terms-close');
  const termsAcceptBtn = $('#terms-accept');
  let termsTrigger = null;

  function openTerms(event) {
    if (!termsModal) return;
    if (event) event.preventDefault();
    closeMenu(false);
    closeSearch(false);
    closePrivacy(false);
    termsTrigger = document.activeElement;
    termsModal.classList.add('is-open');
    termsModal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    const bodyEl = $('#terms-body');
    if (bodyEl) bodyEl.scrollTop = 0;
    setTimeout(() => termsCloseBtn && termsCloseBtn.focus(), 90);
  }

  function closeTerms(restoreFocus = true) {
    if (!termsModal || !termsModal.classList.contains('is-open')) return;
    termsModal.classList.remove('is-open');
    termsModal.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (restoreFocus && termsTrigger) termsTrigger.focus();
  }

  if (termsOpenLink) termsOpenLink.addEventListener('click', openTerms);
  if (termsCloseBtn) termsCloseBtn.addEventListener('click', () => closeTerms());
  if (termsAcceptBtn) termsAcceptBtn.addEventListener('click', () => closeTerms());

  if (termsModal) {
    termsModal.addEventListener('click', (event) => {
      if (event.target === termsModal) closeTerms();
    });

    document.addEventListener('keydown', (event) => {
      if (!termsModal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeTerms();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = $$('a[href], button:not([disabled]), [tabindex="0"]', termsModal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  const revealElements = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-in'));
  }

  /* ---------- Navegación activa ---------- */
  const navLinks = $$('.nav a');
  const navSections = navLinks
    .map((link) => {
      const hash = link.getAttribute('href');
      return hash && hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
    })
    .filter(Boolean);
  const heroSection = document.getElementById('inicio');
  if (heroSection) navSections.unshift(heroSection);

  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.id === 'inicio') {
          navLinks.forEach((link) => {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          });
          return;
        }
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-32% 0px -58% 0px', threshold: 0 });

    navSections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- Cerrar menú al pasar a escritorio ---------- */
  const desktopQuery = window.matchMedia('(min-width: 1025px)');
  const onDesktopChange = (event) => {
    if (event.matches) closeMenu(false);
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', onDesktopChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(onDesktopChange);
  }
})();
