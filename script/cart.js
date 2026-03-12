/*
rendercrt();a

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let cartContainer = document.getElementById("cart-items");

cart.forEach(item => {
  cartContainer.innerHTML += `
    <div class="cart-item">
      ${item.img} - ${item.name} - 
      $${item.price} x ${item.quantity}
    </div>
    
  `
  console.log(cart.js);
});
*/

 function loadCart() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let container = document.getElementById("cart-items");
    localStorage.setItem("cart", JSON.stringify(cart));

    container.innerHTML = "";

    cart.forEach(item => {

    container.innerHTML += `
    <div>
    <h3>${item.name}</h3>
    <p>₦${item.price}</p>
    <p>Qty: ${item.quantity}</p>
    </div>
    `;
    });

    }

    loadCart();



