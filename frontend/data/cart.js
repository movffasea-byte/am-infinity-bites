  export function getCart() {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

     export function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    

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

  export function decreaseQty(productId) {
      let cart = getCart(); /*JSON.parse(localStorage.getItem("cart")) || [];*/

      let item = cart.find(i => i.productId === productId);

      if (item) {
         if(item.quantity > 1) {
        item.quantity--;
      } else{
        //remove item if qty = 1
        cart = cart.filter(i => i.productId !== productId);
      }

      saveCart(cart); /*localStorage.setItem("cart", JSON.stringify(cart));*/
    }
  }

  export function increaseQty(productId) {
      let cart = getCart(); /*JSON.parse(localStorage.getItem("cart")) || [];*/

      let item = cart.find(i => i.productId === productId);
      if (item) {
        item.quantity++;
      }

      saveCart(cart); /*localStorage.setItem("cart", JSON.stringify(cart))*/
    }

    
    export function removeItem(productId) {
      let cart = getCart(); /*JSON.parse(localStorage.getItem("cart")) || [];*/

      cart = cart.filter(i => i.productId !== productId);

      getCart(cart); /*localStorage.setItem("cart", JSON.stringify(cart));*/
    }

    
    

  


