document.addEventListener("DOMContentLoaded", async function () {

  const referenceDisplay = document.getElementById("referenceDisplay");
  const verifyStatus = document.getElementById("verifyStatus");

  // Get reference from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference") || localStorage.getItem("paymentReference");

  if (!reference) {
    referenceDisplay.textContent = "No reference found";
    verifyStatus.textContent = "Could not verify payment.";
    verifyStatus.style.color = "#e05252";
    return;
  }

  referenceDisplay.textContent = `Reference: ${reference}`;

  try {
    const res = await fetch(`http://localhost:3000/payment/verify/${reference}`);
    const data = await res.json();

    if (data.data && data.data.status === "success") {
      verifyStatus.textContent = "✅ Payment verified successfully!";
      verifyStatus.style.color = "#4caf7d";
      localStorage.removeItem("cart");
      localStorage.removeItem("paymentReference");
    } else {
      verifyStatus.textContent = "⚠️ Payment pending or failed. Contact support.";
      verifyStatus.style.color = "#e05252";
    }
  } catch (err) {
    console.error("Verification error:", err);
    verifyStatus.textContent = "Could not verify payment. Please contact support.";
    verifyStatus.style.color = "#e05252";
  }

});