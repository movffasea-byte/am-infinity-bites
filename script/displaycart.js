 import { getCart } from "../data/cart.js";  
 
 export function displayCart() {
  const container = document.querySelector(".cart-container");
  const cart = getCart();

  /*if (!cart) {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }
*/
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty</p>";
    return;
  }

 
  cart.forEach(item => {
    const container = document.createElement("div");
    div.classList.add("cart-item")

    container.innerHTML += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>₦${item.price}</p>
        <p>Qty: ${item.quantity}</p>

        <button class="js-increase" data-id="${item.productId}">+</button>
        <button class="js-decrease" data-id="${item.productId}">-</button>
        <button class="js-remove" data-id="${item.productId}">Remove</button>
      </div>
    `;
  });

  }