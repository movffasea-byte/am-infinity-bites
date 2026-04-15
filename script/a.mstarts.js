import { addToCart } from '../data/cart.js';

function updateCartQuantity() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartQuantity = 0;
  cart.forEach((item) => { cartQuantity += item.quantity; });

  const jsQty = document.querySelector('.js-cart-quantity');
  if (jsQty) jsQty.innerHTML = cartQuantity;

  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = cartQuantity;
}

async function loadProducts() {
  try {
    // Fetch products and addons in parallel
    const [productsRes, addonsRes] = await Promise.all([
      fetch('http://localhost:3000/products'),
      fetch('http://localhost:3000/api/addons')
    ]);

    const products = await productsRes.json();
    const addons = await addonsRes.json();

    const container = document.getElementById('cart-container');
    if (!container) return;

    container.innerHTML = '';

    const CATEGORIES = [
      'Greek Yogurt Fruit Parfait',
      'Fruit Salad Mix',
      'Fruit Juice',
      'Tasty Yogurt',
      'Fruit Smoothie'
    ];

    CATEGORIES.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat);
      if (catProducts.length === 0) return;

      // Category Header
      const header = document.createElement('div');
      header.classList.add('category-header');
      header.innerHTML = `<h2>${cat}</h2>`;
      container.appendChild(header);

      // Products Row
      const row = document.createElement('div');
      row.classList.add('category-row');

      catProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Build addon checkboxes HTML
        const addonsHTML = addons.map(addon => `
          <label class="addon-item">
            <input 
              type="checkbox" 
              class="addon-checkbox"
              data-addon-id="${addon.id}"
              data-addon-name="${addon.name}"
              data-addon-price="${addon.price}"
            />
            <span>${addon.name}</span>
            <span class="addon-price">+₦${Number(addon.price).toLocaleString()}</span>
          </label>
        `).join('');

        card.innerHTML = `
          <img src="${product.image || 'images/default-fruit.jpg'}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p class="price" id="display-price-${product.id}">
            ₦${Number(product.price).toLocaleString()}
          </p>
          <p class="desc">${product.description || ''}</p>

          <div class="quantity-control">
            <button class="qty-btn minus" data-product-id="${product.id}">−</button>
            <span class="qty-display" id="qty-${product.id}">1</span>
            <button class="qty-btn plus" data-product-id="${product.id}">+</button>
          </div>

          <div class="addons-section">
            <button class="addons-toggle" data-product-id="${product.id}">
            Addons <span class="toggle-arrow">▼</span>
            </button>
            <div class="addons-dropdown" id="addons-${product.id}" style="display:none;">
              ${addonsHTML}
            </div>
          </div>

          <p class="total-price" id="total-${product.id}">
            Total: ₦${Number(product.price).toLocaleString()}
          </p>

          <button class="js-add-to-cart"
            data-product-id="${product.id}"
            data-name="${product.name}"
            data-price="${product.price}"
            data-image="${product.image}">
            Add to Cart
          </button>
        `;

        row.appendChild(card);
      });

      container.appendChild(row);
    });

    // ── Quantity controls ──
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const qtyEl = document.getElementById(`qty-${productId}`);
        let qty = parseInt(qtyEl.textContent);

        if (btn.classList.contains('plus')) qty++;
        if (btn.classList.contains('minus') && qty > 1) qty--;

        qtyEl.textContent = qty;
        recalcTotal(productId);
      });
    });

    // ── Addon toggle dropdowns ──
    document.querySelectorAll('.addons-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const dropdown = document.getElementById(`addons-${productId}`);
        const arrow = btn.querySelector('.toggle-arrow');
        const isOpen = dropdown.style.display !== 'none';
        dropdown.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▼' : '▲';
      });
    });

    // ── Addon checkboxes → recalc total ──
    document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Find which product this addon belongs to
        const dropdown = checkbox.closest('.addons-dropdown');
        const productId = dropdown.id.replace('addons-', '');
        recalcTotal(productId);
      });
    });

    // ── Add to Cart ──
    document.querySelectorAll('.js-add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const productId = Number(button.dataset.productId);
        const productName = button.dataset.name;
        const productPrice = Number(button.dataset.price);
        const productImage = button.dataset.image;
        const qty = parseInt(
          document.getElementById(`qty-${productId}`).textContent
        );

        // Collect checked addons
        const checkedAddons = [];
        document.querySelectorAll(
          `#addons-${productId} .addon-checkbox:checked`
        ).forEach(cb => {
          checkedAddons.push({
            id: cb.dataset.addonId,
            name: cb.dataset.addonName,
            price: Number(cb.dataset.addonPrice)
          });
        });

        // Total price = (product price + sum of addon prices) × qty
        const addonTotal = checkedAddons.reduce((sum, a) => sum + a.price, 0);
        const finalPrice = (productPrice + addonTotal) * qty;

        addToCart(productId, productName, finalPrice, productImage, qty, checkedAddons);
        updateCartQuantity();

        // Visual feedback
        button.textContent = '✓ Added!';
        button.style.background = '#28a745';
        setTimeout(() => {
          button.textContent = 'Add to Cart';
          button.style.background = '';
        }, 1500);
      });
    });

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// Recalculates the displayed total for a product card
function recalcTotal(productId) {
  const qty = parseInt(
    document.getElementById(`qty-${productId}`).textContent
  );

  // Get base product price from the Add to Cart button's data attribute
  const button = document.querySelector(
    `.js-add-to-cart[data-product-id="${productId}"]`
  );
  const basePrice = Number(button.dataset.price);

  // Sum checked addons
  const addonTotal = Array.from(
    document.querySelectorAll(`#addons-${productId} .addon-checkbox:checked`)
  ).reduce((sum, cb) => sum + Number(cb.dataset.addonPrice), 0);

  const total = (basePrice + addonTotal) * qty;

  document.getElementById(`total-${productId}`).textContent =
    `Total: ₦${total.toLocaleString()}`;
}

// ── Auth / account UI (unchanged) ──
document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
});

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("registerName").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      localStorage.setItem("user", JSON.stringify({ name, email, password }));
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  if (container) loadProducts();
  updateCartQuantity();
});