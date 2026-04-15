document.addEventListener("DOMContentLoaded", function () {

  const bankDetails = document.getElementById("bankDetails");
  const successMessage = document.getElementById("successMessage");
  const confirmBtn = document.getElementById("confirmBtn");

  const API = 'http://localhost:3000';

//LOAD CART FROM STORAGE
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderItemsContainer = document.getElementById("orderItems");
  const totalAmountEl = document.getElementById("totalAmount");
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("User from storage:", user);
  console.log("Email being sent:", user?.email || "customer@email.com");

  let orderTotal = 0;

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    confirmBtn.disabled = true;
  } else {
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

    // ✅ Fixed: was using undeclared 'total' variable
    totalAmountEl.textContent = orderTotal.toLocaleString();
     console.log("Amount being sent:", orderTotal)
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
  // SAVE ORDER TO DATABASE
  // =====================
  async function saveOrder(paymentMethod, reference, status) {
    try {
      const name = localStorage.getItem("customerName") || user?.name || "N/A";
      const phone = localStorage.getItem("customerPhone") || "N/A";
      const address = localStorage.getItem("customerAddress") || "N/A";
      const email = user?.email || "customer@email.com";

      await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          address,
          items: cart,
          amount: orderTotal,
          payment_method: paymentMethod,
          reference: reference || "",
          status
        })
      });
    } catch (err) {
      console.error("Order save error:", err);
    }
  }

  // =====================
  // INITIALIZE PAYMENT
  // =====================
  async function initializePayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {
      alert("Please select a payment method!");
      return;
    }

    const method = selectedPayment.value;
    const email = user?.email || "customer@email.com";

    // PAYSTACK
    if (method === "paystack") {
      try {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Redirecting to Paystack...";


console.log("Sending to Paystack:", { email, amount: orderTotal });

        const response = await fetch(`${API}/payment/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, amount: orderTotal })
        });

        const data = await response.json();
        console.log("Full Paystack response:", JSON.stringify(data));

        if (data.status === true && data.data.authorization_url) {
          await saveOrder("paystack", data.data.reference, "pending");
          localStorage.setItem("paymentReference", data.data.reference);
          
          console.log("Redirecting to:", data.data.authorization_url);

          window.location.replace(data.data.authorization_url);
        } else {
          alert("Failed to initialize payment. Please try again.");
          confirmBtn.disabled = false;
          confirmBtn.textContent = "Confirm & Pay";
        }
      } catch (err) {
        console.error("Payment error:", err);
        alert("Unable to connect to payment gateway.");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm & Pay";
      }

    // BANK TRANSFER
    } else if (method === "bank") {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Saving order...";

      await saveOrder("bank", "", "pending");

      successMessage.classList.remove("hidden");
      successMessage.textContent = "✅ Please complete your bank transfer. We will confirm your order shortly.";

      localStorage.removeItem("cart");
      localStorage.removeItem("customerName");
      localStorage.removeItem("customerPhone");
      localStorage.removeItem("customerAddress");

      confirmBtn.textContent = "Order Placed!";

    // CASH ON DELIVERY
    } else if (method === "cash") {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Saving order...";

      await saveOrder("cash", "", "pending");

      successMessage.classList.remove("hidden");
      successMessage.textContent = "✅ Order confirmed! Pay on delivery. We will contact you shortly.";

      localStorage.removeItem("cart");
      localStorage.removeItem("customerName");
      localStorage.removeItem("customerPhone");
      localStorage.removeItem("customerAddress");

      confirmBtn.textContent = "Order Placed!";
    }
  }

  // =====================
  // CONFIRM BUTTON
  // =====================
  confirmBtn.addEventListener("click", initializePayment);

});