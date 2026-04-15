// header.js — Runs on every page
// - Logged-in users: shows "Hi [Firstname]" on ALL pages, links to dashboard.html
// - Guests on a.mstarts.html / checkout.html: shows "Dashboard"
// - Guests on all other pages: shows "Hi Guest" (they shouldn't normally reach these pages without logging in)

(function () {
  const accountName = document.getElementById("accountName");
  const accountBtn  = document.getElementById("accountBtn");

  if (!accountName) return;

  // Read user from localStorage (set at login)
  const stored = localStorage.getItem("user");
  let user = null;
  try { user = stored ? JSON.parse(stored) : null; } catch (e) { user = null; }

  const currentPage = window.location.pathname.split("/").pop() || "a.mstarts.html";

  // Pages where guests should see "Dashboard" instead of "Hi Guest"
  const guestDashboardPages = ["a.mstarts.html", "checkout.html", ""];

  if (user && (user.name || user.firstName)) {
    // ── LOGGED IN ──
    // Extract just the first name
    const fullName = user.name || user.firstName || "";
    const firstName = fullName.trim().split(" ")[0];

    accountName.textContent = "Hi " + firstName;

    // Make sure the link always goes to dashboard when logged in
    if (accountBtn) accountBtn.setAttribute("href", "dashboard.html");

  } else {
    // ── GUEST ──
    if (guestDashboardPages.includes(currentPage)) {
      accountName.textContent = "Dashboard";
    } else {
      // On order-confirm, payment-success etc. guests shouldn't normally be here
      // but show "Dashboard" gracefully
      accountName.textContent = "Dashboard";
    }

    if (accountBtn) accountBtn.setAttribute("href", "dashboard.html");
  }
})();

// ── Helper used by checkout.js to block guest orders ──
function showPlaceOrderGuestPopup() {
  alert("Please log in or create an account to place an order.");
  window.location.href = "loginsys.html";
}