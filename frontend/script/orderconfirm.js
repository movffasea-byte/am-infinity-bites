document.addEventListener("DOMContentLoaded", function () {

  const bankDetails = document.getElementById("bankDetails");
  const successMessage = document.getElementById("successMessage");
  const confirmBtn = document.getElementById("confirmBtn");

  // =====================
  // LOAD CART FROM STORAGE
  // =====================
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderItemsContainer = document.getElementById("orderItems");
  const totalAmountEl = document.getElementById("totalAmount");

  let orderTotal = 0; //declared at the top

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    confirmBtn.disabled = true;
  } else {
    let total = 0;

    cart.forEach(item => {
      orderTotal += item.price * item.quantity;

      const row = document.createElement("div");
      row.classList.add("order-item");
      row.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">₦${(item.price * item.quantity).toLocaleString()}</span>
      `;
      orderItemsContainer.appendChild(row);
    });

    totalAmountEl.textContent = total.toLocaleString();
  }

  // =====================
  // SHOW/HIDE BANK DETAILS
  // =====================
  const paymentOptions = document.getElementsByName("payment");
  paymentOptions.forEach(option => {
    option.addEventListener("change", function () {
      if (this.value === "bank") {
        bankDetails.classList.remove("hidden");
      } else {
        bankDetails.classList.add("hidden");
      }
    });
  });

  // =====================
  // INITIALIZE PAYSTACK
  // =====================
  async function initializePayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {
      alert("Please select a payment method!");
      return;
    }

    const method = selectedPayment.value;


     if (method === "paystack") {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user?.email || "customer@email.com";
     
 
        const response = await fetch("http://localhost:3000/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            amount: orderTotal // ✅ plain number, backend converts to kobo
          })
        });

        const data = await response.json();

        if (data.status === true && data.data.authorization_url) {

          //save refrence before redirecting
          localStorage.setItem("paymentReference", data.data.reference);
          window.location.href = data.data.authorization_url;
        } else {
          alert("Failed to initialize payment. Please try again.");
        }
      } catch (err) {
        console.error("Payment error:", err);
        alert("Unable to connect to payment gateway.");
      }

    } else if (method === "bank") {
      successMessage.classList.remove("hidden");
      successMessage.textContent = "✅ Please complete your bank transfer. We will confirm your order shortly.";
      localStorage.removeItem("cart");

    } else if (method === "cash") {
      successMessage.classList.remove("hidden");
      successMessage.textContent = "✅ Order confirmed! Pay on delivery.";
      localStorage.removeItem("cart");
    }
  }

  // =====================
  // CONFIRM BUTTON
  // =====================
  confirmBtn.addEventListener("click", initializePayment);

});