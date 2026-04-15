document.addEventListener("DOMContentLoaded", async function () {

  const referenceDisplay = document.getElementById("referenceDisplay");
  const verifyStatus = document.getElementById("verifyStatus");

  const API = 'http://localhost:3000';

  // Prevent running more than once
  if (sessionStorage.getItem("paymentVerified")) {
    const cached = sessionStorage.getItem("paymentVerified");
    referenceDisplay.textContent = `Reference: ${sessionStorage.getItem("lastReference") || 'N/A'}`;
    verifyStatus.textContent = cached === "success"
      ? "✅ Payment verified successfully!"
      : "⚠️ Payment pending or failed. Contact support.";
    verifyStatus.style.color = cached === "success" ? "#4caf7d" : "#e05252";
    return;
  }

  // Get reference from URL first, then localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference") || localStorage.getItem("paymentReference");

  console.log("Reference found:", reference);

  if (!reference) {
    referenceDisplay.textContent = "No reference found";
    verifyStatus.textContent = "Could not verify payment.";
    verifyStatus.style.color = "#e05252";
    return;
  }

  referenceDisplay.textContent = `Reference: ${reference}`;
  sessionStorage.setItem("lastReference", reference);

  try {
    const res = await fetch(`${API}/payment/verify/${reference}`);
    const data = await res.json();

    if (data.data && data.data.status === "success") {
      verifyStatus.textContent = "✅ Payment verified successfully!";
      verifyStatus.style.color = "#4caf7d";

      // Mark as verified in sessionStorage so reloads don't re-run
      sessionStorage.setItem("paymentVerified", "success");

      // Update order status to paid
      await fetch(`${API}/orders/reference/${reference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      // Clear cart and reference
      localStorage.removeItem("cart");
      localStorage.removeItem("paymentReference");

    } else {
      verifyStatus.textContent = "⚠️ Payment pending or failed. Contact support.";
      verifyStatus.style.color = "#e05252";
      sessionStorage.setItem("paymentVerified", "failed");
    }
  } catch (err) {
    console.error("Verification error:", err);
    verifyStatus.textContent = "Could not verify payment. Please contact support.";
    verifyStatus.style.color = "#e05252";
  }

});