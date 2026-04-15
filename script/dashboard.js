const API = 'http://localhost:3000';
const token = localStorage.getItem('token');

// =====================
// GUARD — redirect if not logged in
// =====================
if (!token) {
  alert('Please login to view your dashboard.');
  window.location.href = 'index.html';
}

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadOrders();

  // Nav switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Save profile
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

  // Save address
  document.getElementById('saveAddressBtn').addEventListener('click', saveAddress);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  });
});

// =====================
// SECTION SWITCHING
// =====================
function switchSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  document.querySelector(`.nav-btn[data-section="${name}"]`).classList.add('active');
}

// =====================
// LOAD PROFILE
// =====================
async function loadProfile() {
  try {
    const res = await fetch(`${API}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      localStorage.removeItem('userToken');
      window.location.href = 'index.html';
      return;
    }

    const user = await res.json();

    // Header
    document.getElementById('headerName').textContent = user.name;

    // Sidebar
    document.getElementById('sidebarName').textContent = user.name;
    document.getElementById('sidebarEmail').textContent = user.email;

    // Welcome
    document.getElementById('welcomeName').textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;

    // Profile form
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';

    // Address form
    document.getElementById('profileAddress').value = user.address || '';

  } catch (err) {
    console.error('Profile load error:', err);
  }
}

// =====================
// LOAD ORDERS
// =====================
async function loadOrders() {
  try {
    const res = await fetch(`${API}/auth/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = await res.json();

    // Stats
    const total = orders.length;
    const paid = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
    const spent = orders
      .filter(o => o.status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.amount), 0);

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPaid').textContent = paid;
    document.getElementById('statSpent').textContent = `₦${spent.toLocaleString()}`;

    // Recent orders (overview — last 3)
    const recentEl = document.getElementById('recentOrdersList');
    if (orders.length === 0) {
      recentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <p>You haven't placed any orders yet.</p>
        </div>`;
    } else {
      recentEl.innerHTML = orders.slice(0, 3).map(o => orderCardHTML(o)).join('');
    }

    // All orders
    const allEl = document.getElementById('allOrdersList');
    if (orders.length === 0) {
      allEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p>No orders found. Start shopping!</p>
        </div>`;
    } else {
      allEl.innerHTML = orders.map(o => orderCardHTML(o)).join('');
    }

  } catch (err) {
    console.error('Orders load error:', err);
    document.getElementById('recentOrdersList').innerHTML = '<div class="loading">Failed to load orders.</div>';
    document.getElementById('allOrdersList').innerHTML = '<div class="loading">Failed to load orders.</div>';
  }
}

// =====================
// ORDER CARD HTML
// =====================
function orderCardHTML(order) {
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'N/A';

  const items = Array.isArray(order.items)
    ? order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
    : 'N/A';

  const badgeClass = {
    'paid': 'badge-paid',
    'delivered': 'badge-delivered',
    'pending': 'badge-pending',
    'preparing': 'badge-preparing',
    'cancelled': 'badge-cancelled'
  }[order.status] || 'badge-pending';

  return `
    <div class="order-card">
      <div class="order-top">
        <div>
          <div class="order-id">Order #${order.id}</div>
          <div class="order-date">${date}</div>
        </div>
        <span class="order-badge ${badgeClass}">${order.status || 'pending'}</span>
      </div>
      <div class="order-items">${items}</div>
      <div class="order-footer">
        <span class="order-amount">₦${Number(order.amount).toLocaleString()}</span>
        <span class="order-method">${order.payment_method || 'N/A'}</span>
      </div>
    </div>
  `;
}

// =====================
// SAVE PROFILE
// =====================
async function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const address = document.getElementById('profileAddress').value.trim();
  const msg = document.getElementById('profileMsg');

  if (!name) {
    showMsg(msg, 'Name is required.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone, address })
    });

    const data = await res.json();

    if (res.ok) {
      showMsg(msg, '✓ Profile updated successfully!', 'success');
      document.getElementById('sidebarName').textContent = name;
      document.getElementById('headerName').textContent = name;
    } else {
      showMsg(msg, data.message || 'Failed to update profile.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Server error. Try again.', 'error');
  }
}

// =====================
// SAVE ADDRESS
// =====================
async function saveAddress() {
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const address = document.getElementById('profileAddress').value.trim();
  const msg = document.getElementById('addressMsg');

  if (!address) {
    showMsg(msg, 'Please enter a delivery address.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone, address })
    });

    const data = await res.json();

    if (res.ok) {
      showMsg(msg, '✓ Address saved successfully!', 'success');
    } else {
      showMsg(msg, data.message || 'Failed to save address.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Server error. Try again.', 'error');
  }
}

// =====================
// HELPER
// =====================
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `msg ${type}`;
  setTimeout(() => {
    el.textContent = '';
    el.className = 'msg';
  }, 4000);
}