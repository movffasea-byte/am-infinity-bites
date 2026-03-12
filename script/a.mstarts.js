
const products = [
    {
      name: "Classic Fruit Parfait",
      price: 2500,
      img: "images/unnamed111.jpg"
    },
    {
      name: "Healthy Fruit Blend",
      price: 8000,
      img: "images/ab15.jpg"
    },
    {
      name: "Yogurt drowling bites",
      price: 4000,
      img: "images/ab10.jpg"
    },
    {
      name: "fresh Salad Mix",
      price: 20000,
      img: "images/ab8.jpg"
    },
     {
      name: "Bossy Special",
      price: 6000,
      img: "images/ab2.jpg"
     }
  ];


  
    let list = document.getElementById("productList");  

    products.forEach((p,i) => {
      list.innerHTML += `
        <div class="card">
          <img src="${p.img}" alt="${p.name}">
          <div class="card-body">
            <h3>${p.name}</h3>
            <div class="price">₦${p.price}</div>
            <button onclick="addToCart(${i})">Add to Cart</button>
          </div>
        </div>
        `;
       
    });
    
  
    document.querySelector(".js-products-menu").
    innerHTML = products;

 /* function addToCart(i) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(products[i]);
    document.getElementById("cartCount")
    .innerText = cart.length;
    (products[i].name + " added to cart");
    localStorage.setItem("cart", JSON.stringify(cart));}





   
   
  
   let addToCart  = JSON.parse(localStorage.setItem("cart")) || []; 

    let  product = products[i];
     cart.push(product);
     localStorage.setItem("cart", JSON.stringify(cart));

  

  if item aready exist in cart, update quantity instead of adding new item
    let existingItem = 
    cart.find(item => item.name === product.name);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

     localStorage.setItem("addToCart", JSON.stringify(cart));
     document.getElementById("cartCount")
     .innerText = cart.length;
     alert(product.name + " added to cart");
     console.log(cart);
  



  function viewCart() {
    window.location.href = "cart.html";
    if (cart.length === 0) {
      (`Cart is empty`);
      return;
    
    };

   
   

    
   
   let cart = JSON.parse(localStorage.getItem("cart")) || [];
   
    function addToCart(img,name,price) {
      cart.push({ img, name, price });
      document.getElementById("cartCount").innerText = cart.length;
      (name + " added to cart");
    }

    localStorage.saveitem("addToCart", JSON.stringify(carted-item));

  alert("Item added to cart");
      return;
      

    let total = cart.reduce((s, p) => s + p.price, 0);
    let names = cart.map(p => p.name).join("\n");

    alert("Your Cart:\n\n" + names + "\n\nTotal: ₦" + total);
  }

  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }

  renderProducts();
  */
  