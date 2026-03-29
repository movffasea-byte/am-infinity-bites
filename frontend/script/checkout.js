import { products } from '../data/products.js';
import { increaseQty, decreaseQty, removeItem } from '../data/cart.js';
import { displayCart } from './displaycart.js';



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
        <button class="decrease-quantity" 
        data-product-id="${product.id}">−</button>
        <span>${cartItem.quantity}</span>
        <button class="increase-quantity" 
        data-product-id="${product.id}">+</button>
      </div>
     <button class="remove" 
     data-product-id="${product.id}"
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

/*// BUTTON EVENTS



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
    removeItem(Number(e.target.dataset.id));
    
  }

});
   */
  /*
  document.querySelector(".cart-container").addEventListener("click", (e))
  let id = Number(e.target.dataset.id);

  if (e.target.classList.contains(".js-increase")) {
    increaseQty(id);
    
  
  }

  if (e.target.classList.contains(".js-decrease")) {
    decreaseQty(id);
    
  
  }

  if (e.target.classList.contains(".js-remove")) {
    removeItem(id);
  
    
 }
//load cart on page start
displayCart("cart");
*/

  
  document.querySelector('.js-decrease')
  .forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      decreaseQty(productId)
      console.log(cart);
    });
  });
  
  document.querySelectorAll('.js-increase')
  .forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    increaseQty(productId)
    console.log(cart);
  });
});
 
    document.querySelectorAll('.js-remove')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const productid = button.dataset.product.Id;
        removeItem(productid)
        console.log(cart);
      });
    });
    

/*
document.querySelector("button")
.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains("js-increase")) {
    increaseQty(id);
  }

  if (e.target.classList.contains("js-decrease")) {
    decreaseQty(id);
  }

  if (e.target.classList.contains("js-remove")) {
    removeItem(id);

  }

  //load cart on page start
 displayCart("cart");
});
 */
document.getElementById("orderForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Hide form
  document.getElementById("checkoutForm").style.display = "none";

  // Show confirmation
  document.getElementById("confirmationMessage").style.display = "block";

  // Clear cart after order
  localStorage.removeItem("cart");
});