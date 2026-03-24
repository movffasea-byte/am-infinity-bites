import { products } from '../data/products.js';
import {  increaseQty, decreaseQty, removeItem } from '../data/cart.js';

let container = document.getElementById("cartItems");
 


  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  /*
  let container = document.getElementById("cartItems");
*/
  container.innerHTML = "";

  //if cart empty
  if (cartItems.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
  } else {

  cartItems.forEach((cartItem) => {
  const product = products.find(p => p.id === cartItem.id);

    if (!product) return;

      container.innerHTML += `
  <div class="cart-item">
    <img src="${product.img}" alt="${product.name}">
    
    <div class="card-body">
      <h3>${product.name}</h3>
      <div class="price">₦${product.price}</div>

      <div class="quantity-controls">
        <button class="js-decrease" 
        data-product-id="${product.id}">−</button>
        <span>${cartItem.quantity}</span>
        <button class="js-increase" 
        data-product-id="${product.id}">+</button>
      </div>
     <button class="js-remove" data-product-id="${product.id}"
      class="remove-btn">
        Remove
      </button>
    </div>
  </div>
`;
  });
}
  


  // Total Price
  let total = cartItems.reduce((total, cartItem) => {
    let product = products.find(p => p.id === cartItem.id);
    return total + (product ? product.price * cartItem.quantity : 0);
  }, 0);

  document.getElementById("totalPrice").textContent = `Total: ₦${total}`;
  document.querySelector('.order-count').textContent = cartItems.length;

// BUTTON EVENTS
document.addEventListener("click", (e) => {

  if (e.target.classList.contains("js-increase")) {
    increaseQty(e.target.dataset.id);
    location.reload();
  }

  if (e.target.classList.contains("js-decrease")) {
    decreaseQty(e.target.dataset.id);
    location.reload();
  }

  if (e.target.classList.contains("js-remove")) {
    removeItem(e.target.dataset.id);
    location.reload();
  }

});
    
document.getElementById("orderForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Hide form
  document.getElementById("checkoutForm").style.display = "none";

  // Show confirmation
  document.getElementById("confirmationMessage").style.display = "block";

  // Clear cart after order
  localStorage.removeItem("cart");
});

    
    

