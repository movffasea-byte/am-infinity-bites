  export function getCart() {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

     export function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
/*
    window.viewCart = function() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("🛒 Your cart is empty");
    return;
  }

  window.location.href = "checkout.html";
}

 viewCart();
*/
   /* export function addToCart(productId) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existingItem;

  cart.forEach((item) => {
    if (productId === item.id) {
      existingItem = item;
    }
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    }); 
  }

  localStorage.setItem("cart", JSON.stringify(cart));

}*/
    

   export function addToCart(productId) {
  const cart = getCart();

  let item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
}

  export function increaseQty(productId) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      let item = cart.find(i => i.productId === productId);
      if (item) {
        item.quantity++;
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      displayCart(cart);
    }

    export function decreaseQty(productId) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      let item = cart.find(i => i.productId === productId);
      if (item && item.quantity > 1) {
        item.quantity--;
      }

      localStorage.setItem("cart", JSON.stringify(cart));
     
      displayCart(cart);
    }

    export function removeItem(productId) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      cart = cart.filter(i => i.productId !== productId);

      localStorage.setItem("cart", JSON.stringify(cart));
      
      
      displayCart(cart);
    }

    
    

  


