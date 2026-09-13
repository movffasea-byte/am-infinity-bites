// header.js — Runs on every page
// - Logged-in users: shows "Hi [Firstname]" on ALL pages, links to dashboard.html
// - Guests: shows "Dashboard"
// Identity now comes from an httpOnly cookie via GET /auth/me — no localStorage read.

(async function () {
  const accountName = document.getElementById("accountName");
  const accountBtn  = document.getElementById("accountBtn");

  if (!accountName) return;

  const API = 'https://am-infinity-bites-production.up.railway.app';

  let user = null;
  try {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    if (res.ok) {
      user = await res.json();
    }
  } catch (e) {
    user = null;
  }

  if (user && user.name) {
    // ── LOGGED IN ──
    const firstName = user.name.trim().split(" ")[0];
    accountName.textContent = "Hi " + firstName;
    if (accountBtn) accountBtn.setAttribute("href", "dashboard.html");
  } else {
    // ── GUEST ──
    accountName.textContent = "Dashboard";
    if (accountBtn) accountBtn.setAttribute("href", "dashboard.html");
  }
})();

// ── Helper used by checkout.js to block guest orders ──
function showPlaceOrderGuestPopup() {
  alert("Please log in or create an account to place an order.");
  window.location.href = "loginsys.html";
}