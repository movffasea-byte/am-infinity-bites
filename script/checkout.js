document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const orderCountEl = document.querySelector('.order-count');

  // =====================
  // RENDER CART
  // =====================
  function renderCart() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    container.innerHTML = "";

    if (cartItems.length === 0) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      totalPriceEl.textContent = "Total: ₦0";
      if (orderCountEl) orderCountEl.textContent = "0";
      return;
    }

    cartItems.forEach((cartItem) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <img src="${cartItem.image || ''}" alt="${cartItem.name}" />
        <div class="card-body">
          <h3>${cartItem.name}</h3>
          <div class="price">₦${Number(cartItem.price).toLocaleString()}</div>
          <div class="quantity-controls">
            <button class="decrease-quantity" data-product-id="${cartItem.id}">−</button>
            <span>${cartItem.quantity}</span>
            <button class="increase-quantity" data-product-id="${cartItem.id}">+</button>
          </div>
          <button class="remove-btn" data-product-id="${cartItem.id}">Remove</button>
        </div>
      `;
      container.appendChild(div);
    });

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPriceEl.textContent = `Total: ₦${total.toLocaleString()}`;
    if (orderCountEl) orderCountEl.textContent = cartItems.length;

    attachListeners();
  }

  // =====================
  // CART FUNCTIONS
  // =====================
  function increaseQty(id) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(i => i.id === id);
    if (item) item.quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function decreaseQty(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  // =====================
  // ATTACH LISTENERS
  // =====================
  function attachListeners() {
    document.querySelectorAll('.increase-quantity').forEach(button => {
      button.addEventListener('click', () => {
        increaseQty(Number(button.dataset.productId));
      });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
      button.addEventListener('click', () => {
        decreaseQty(Number(button.dataset.productId));
      });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', () => {
        removeItem(Number(button.dataset.productId));
      });
    });
  }

// At the top of placeOrder / initializePayment function
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  showPlaceOrderGuestPopup(); // ← this function comes from header.js
  return;
}
// rest of your order logic continues below...

  // =====================
  // ORDER FORM
  // =====================
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      localStorage.setItem("customerName", document.getElementById("name").value);
      localStorage.setItem("customerPhone", document.getElementById("phone").value);
      localStorage.setItem("customerAddress", document.getElementById("address").value);

      document.getElementById("checkoutForm").style.display = "none";
      document.getElementById("confirmationMessage").style.display = "block";

      setTimeout(() => {
        window.location.href = "orderconfirm.html";
      }, 2000);
    });
  }

  // Initial render
  renderCart();

});