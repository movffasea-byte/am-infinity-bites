export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(productId, name, price, image) {
  const cart = getCart();

  let item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += 1;
  } else {
    // ✅ now saves name, price and image too
    cart.push({ id: productId, name, price, image, quantity: 1 });
  }

  saveCart(cart);
}

export function decreaseQty(productId) {
  let cart = getCart();

  // ✅ fixed: was i.productId, should be i.id
  let item = cart.find(i => i.id === productId);

  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      cart = cart.filter(i => i.id !== productId);
    }
    saveCart(cart);
  }
}

export function increaseQty(productId) {
  let cart = getCart();

  // ✅ fixed: was i.productId, should be i.id
  let item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity++;
  }

  saveCart(cart);
}

export function removeItem(productId) {
  let cart = getCart();

  // ✅ fixed: was i.productId, should be i.id
  // ✅ fixed: was getCart(cart), should be saveCart(cart)
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
}

    
    

  


