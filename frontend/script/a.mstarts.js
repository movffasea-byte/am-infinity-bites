   import { addToCart} from '../data/cart.js';
   import {products} from '../data/products.js';
   
   let list = document.getElementById("cart-container");  

    products.forEach((p,i) => {
      list.innerHTML += `
        <div class="card">
          <img src="${p.img}" alt="${p.name}">
          <div class="card-body">
            <h3>${p.name}</h3>
            <div class="price">₦${p.price}</div>
            <button class="js-add-to-cart" 
            data-product-id="${p.id}"
            >Add to Cart
            </button>
          </div>
        </div>
        `;
      });
    
  /*
    document.querySelector(".js-product-menu")
    products.innerHTML = products;
    */
    

    
    function updateCartQuantity () {
      let cart = 
      JSON.parse(localStorage.getItem("cart")) || [];

      

      let cartQuantity = 0;

      cart.forEach((item) => {
      cartQuantity += item.quantity;
      });

      document.querySelector(`.js-cart-quantity`)
      .innerHTML = cartQuantity;

      document.getElementById("cartCount").
      textContent = cartQuantity;
    }

       document.querySelectorAll(".js-add-to-cart") 
       .forEach((button) =>{
      button.addEventListener(`click`, () => {
       const productId = button.dataset.productId;
       addToCart(productId);
       updateCartQuantity();
       });
    });

// Update cart quantity on page load
    updateCartQuantity();


    document.addEventListener("DOMContentLoaded", function () {

  const accountBtn = document.getElementById("accountBtn");
  const dropdown = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");
  const ordersBtn = document.getElementById("ordersBtn");
  const accountName = document.getElementById("accountName");
  const accountBox = document.getElementById("accountBox");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
  // Don't redirect - just hide account features
  document.getElementById("accountBtn").style.display = "none";
  return;
}

  // 👤 Show first name only
  const firstName = user.name.split(" ")[0];
  accountName.textContent = firstName;

  // Toggle dropdown
  accountBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    dropdown.classList.remove("show");
  });

  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Profile redirect
  profileBtn.addEventListener("click", function () {
    window.location.href = "profile.html";
  });

  // Orders redirect
  ordersBtn.addEventListener("click", function () {
    window.location.href = "orders.html";
  });

  // Logout with confirmation
  logoutBtn.addEventListener("click", function () {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      window.location.href = "loginsys.html";
    }
  });

});

document.addEventListener("DOMContentLoaded", function () {

  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");

  if (registerForm) { 
    registerForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const user = { name, email, password };

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Send Email using EmailJS
    emailjs.send("service_tjgism2", "template_ewnz64r", {
      email:'movffasea@gmail.com',
      passcode:'096321',
      project_name:'A&M INFINITY BITES',
      to_name: name,
      to_email: email,
      message: "Welcome! Your registration was successful."
    })
    .then(function(response) {

      registerMessage.style.color = "green";
      registerMessage.textContent = "Registration Successful! Redirecting...";

      // Redirect to Home Page after 2 seconds
      setTimeout(function(){
        window.location.href = "home.html";
      }, 2000);

    }, function(error) {
      registerMessage.style.color = "red";
      registerMessage.textContent = "Email failed but registration saved.";
    });

  });
}

});

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();

    const container = document.getElementById('cart-container');
    if (!container) return;

    container.innerHTML = '';

    const CATEGORIES = [
      'Greek Yogurt Fruit Parfait',
      'Fruit Salad Mix',
      'Fruit Juice',
      'Tasty Yogurt'
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
        card.innerHTML = `
          <img src="${product.image || 'images/default-fruit.jpg'}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p class="price">₦${Number(product.price).toLocaleString()}</p>
          <p class="desc">${product.description || ''}</p>
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

    // Attach cart buttons
    document.querySelectorAll('.js-add-to-cart').forEach((button) => {
      button.addEventListener('click', () => {
        const productId = Number(button.dataset.productId);
        const productName = button.dataset.name;
        const productPrice = Number(button.dataset.price);
        const productImage = button.dataset.image;

        addToCart(productId, productName, productPrice, productImage);
        updateCartQuantity();
      });
    });

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// Call it when page loads
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  if (container) {
    loadProducts();
  }
});