   import { addToCart} from '../data/cart.js';
   import {products} from '../data/products.js';
   
   let list = document.getElementById("productList");  

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
    
  
    document.querySelector(".js-product-menu")
    products.innerHTML = products;
    

    
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

  // 🔐 If no user → redirect to login (protect page)
  if (!user) {
    window.location.href = "index.html";
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
      window.location.href = "index.html";
    }
  });

});

document.addEventListener("DOMContentLoaded", function () {

  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");

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

});


