const API = 'http://localhost:3000';
let token = localStorage.getItem('adminToken');
let currentTab = 'products';
let currentOrderFilter = 'active'; // 'active' or 'archived'

const CATEGORIES = [
  'Greek Yogurt Fruit Parfait',
  'Fruit Salad Mix',
  'Fruit Juice',
  'Fruit Smoothies',
  'Tasty Yogurt'
];

const FRUIT_EMOJIS = {
  'orange': '🍊', 'pineapple': '🍍', 'watermelon': '🍉',
  'mango': '🥭', 'banana': '🍌', 'grape': '🍇',
  'strawberry': '🍓', 'apple': '🍎', 'yogurt': '🥛',
  'default': '🍽️'
};

function getEmoji(name) {
  const lower = name.toLowerCase();
  for (const key in FRUIT_EMOJIS) {
    if (lower.includes(key)) return FRUIT_EMOJIS[key];
  }
  return FRUIT_EMOJIS['default'];
}

// =====================
// AUTH
// =====================
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');

  if (!email || !password) {
    msg.textContent = 'Please fill in all fields';
    msg.className = 'msg error';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      document.getElementById('adminName').textContent = data.name;
      msg.textContent = '';
      showAdmin();
    } else {
      msg.textContent = data.message || 'Login failed';
      msg.className = 'msg error';
    }
  } catch (err) {
    msg.textContent = 'Server not reachable';
    msg.className = 'msg error';
  }
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'block';
  checkToken();
  loadProducts();
  loadOrders();
}

function logout() {
  localStorage.removeItem('adminToken');
  token = null;
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

async function checkToken() {
  try {
    const res = await fetch(`${API}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401 || res.status === 403) {
      alert('Session expired! Please login again.');
      logout();
    }
  } catch (err) {
    console.error('Token check failed:', err);
  }
}

// =====================
// TAB SWITCHING
// =====================
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('productsTab').classList.toggle('active', tab === 'products');
  document.getElementById('ordersTab').classList.toggle('active', tab === 'orders');
  document.getElementById('productsView').style.display = tab === 'products' ? 'block' : 'none';
  document.getElementById('ordersView').style.display = tab === 'orders' ? 'block' : 'none';
  if (tab === 'orders') loadOrders();
  if (tab === 'products') loadProducts();
}

// =====================
// PRODUCTS
// =====================
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    document.getElementById('totalProducts').textContent = products.length;

    const list = document.getElementById('productsList');
    list.innerHTML = '';

    if (products.length === 0) {
      list.innerHTML = '<div class="empty-state">No products yet. Add your first product!</div>';
      return;
    }

    CATEGORIES.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat);
      if (catProducts.length === 0) return;

      const section = document.createElement('div');
      section.className = 'category-section';
      section.innerHTML = `<div class="category-label">${cat}</div>`;

      catProducts.forEach(p => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
          <div class="product-info">
            <div class="product-img-placeholder">${getEmoji(p.name)}</div>
            <div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.description || 'No description'}</div>
            </div>
          </div>
          <div class="product-actions">
            <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
            <button class="btn-edit"
              data-id="${p.id}" data-name="${p.name}" data-price="${p.price}"
              data-desc="${p.description || ''}" data-image="${p.image || ''}"
              data-category="${p.category}">Edit</button>
            <button class="btn-danger" data-id="${p.id}">Delete</button>
          </div>
        `;
        section.appendChild(item);
      });

      list.appendChild(section);
    });

    const uncategorized = products.filter(p => !CATEGORIES.includes(p.category));
    if (uncategorized.length > 0) {
      const section = document.createElement('div');
      section.className = 'category-section';
      section.innerHTML = `<div class="category-label">Uncategorized</div>`;
      uncategorized.forEach(p => {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
          <div class="product-info">
            <div class="product-img-placeholder">${getEmoji(p.name)}</div>
            <div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.description || 'No description'}</div>
            </div>
          </div>
          <div class="product-actions">
            <span class="product-price">₦${Number(p.price).toLocaleString()}</span>
            <button class="btn-edit"
              data-id="${p.id}" data-name="${p.name}" data-price="${p.price}"
              data-desc="${p.description || ''}" data-image="${p.image || ''}"
              data-category="${p.category || ''}">Edit</button>
            <button class="btn-danger" data-id="${p.id}">Delete</button>
          </div>
        `;
        section.appendChild(item);
      });
      list.appendChild(section);
    }

    attachProductListeners();

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

function attachProductListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      openEdit(btn.dataset.id, btn.dataset.name, btn.dataset.price,
        btn.dataset.desc, btn.dataset.image, btn.dataset.category);
    });
  });
  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

async function addProduct() {
  const name = document.getElementById('prodName').value;
  const price = document.getElementById('prodPrice').value;
  const category = document.getElementById('prodCategory').value;
  const description = document.getElementById('prodDesc').value;
  const image = document.getElementById('prodImage').value;
  const msg = document.getElementById('addMsg');

  if (!name || !price) {
    msg.textContent = 'Name and price are required!';
    msg.className = 'msg error';
    return;
  }

  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, price: Number(price), description, image, category })
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = '✓ Product added!';
      msg.className = 'msg success';
      document.getElementById('prodName').value = '';
      document.getElementById('prodPrice').value = '';
      document.getElementById('prodDesc').value = '';
      document.getElementById('prodImage').value = '';
      loadProducts();
      setTimeout(() => msg.textContent = '', 3000);
    } else {
      msg.textContent = data.message || 'Failed to add product';
      msg.className = 'msg error';
    }
  } catch (err) {
    msg.textContent = 'Server error';
    msg.className = 'msg error';
  }
}

function openEdit(id, name, price, description, image, category) {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editPrice').value = price;
  document.getElementById('editDesc').value = description;
  document.getElementById('editImage').value = image;
  document.getElementById('editCategory').value = category;
  document.getElementById('editMsg').textContent = '';
  document.getElementById('editModal').classList.add('active');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value;
  const price = document.getElementById('editPrice').value;
  const description = document.getElementById('editDesc').value;
  const image = document.getElementById('editImage').value;
  const category = document.getElementById('editCategory').value;
  const msg = document.getElementById('editMsg');

  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, price: Number(price), description, image, category })
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = '✓ Saved!';
      msg.className = 'msg success';
      loadProducts();
      setTimeout(() => closeModal(), 1000);
    } else {
      msg.textContent = data.message || 'Failed to update';
      msg.className = 'msg error';
    }
  } catch (err) {
    msg.textContent = 'Server error';
    msg.className = 'msg error';
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) loadProducts();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

// =====================
// ORDERS
// =====================
async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await res.json();

    // Stats: count only non-archived orders for totals
    const activeOrders = orders.filter(o => o.archived != 1 && o.archived !== true);
    document.getElementById('totalOrders').textContent = activeOrders.length;

    const pending = activeOrders.filter(o => o.status !== 'paid' && o.status !== 'delivered').length;
    document.getElementById('pendingOrders').textContent = pending;

    const revenue = orders
      .filter(o => o.status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.amount), 0);
    document.getElementById('totalRevenue').textContent = `₦${revenue.toLocaleString()}`;

    // Filter based on current view
    const filtered = currentOrderFilter === 'archived'
      ? orders.filter(o => o.archived == 1 || o.archived === true)
      : orders.filter(o => o.archived != 1 && o.archived !== true);

    renderOrders(filtered);

  } catch (err) {
    console.error('Error loading orders:', err);
    document.getElementById('ordersList').innerHTML =
      '<div class="empty-state">Failed to load orders.</div>';
  }
}

function renderOrders(orders) {
  const list = document.getElementById('ordersList');
  list.innerHTML = '';

  // Filter tabs
  const filterBar = document.createElement('div');
  filterBar.className = 'order-filter-bar';
  filterBar.innerHTML = `
    <button class="order-filter-btn ${currentOrderFilter === 'active' ? 'active' : ''}" data-filter="active">
      Active Orders
    </button>
    <button class="order-filter-btn ${currentOrderFilter === 'archived' ? 'active' : ''}" data-filter="archived">
      Archived Orders
    </button>
  `;
  list.appendChild(filterBar);

  filterBar.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentOrderFilter = btn.dataset.filter;
      loadOrders();
    });
  });

  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = currentOrderFilter === 'archived'
      ? 'No archived orders.'
      : 'No active orders.';
    list.appendChild(empty);
    return;
  }

  orders.forEach(order => {
    const date = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-NG', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : 'N/A';

    const items = Array.isArray(order.items)
      ? order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
      : 'N/A';

    const statusClass = {
      'paid': 'status-paid',
      'delivered': 'status-delivered',
      'pending': 'status-pending',
      'preparing': 'status-preparing',
      'cancelled': 'status-cancelled',
      'cash': 'status-cash',
      'bank': 'status-bank'
    }[order.status] || 'status-pending';

    const isArchived = order.archived == 1 || order.archived === true;

    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML = `
      <div class="order-header">
        <div class="order-meta">
          <span class="order-id">#${order.id}</span>
          <span class="order-date">${date}</span>
        </div>
        <span class="order-status ${statusClass}">${order.status || 'pending'}</span>
      </div>
      <div class="order-body">
        <div class="order-detail">
          <span class="order-label">Customer</span>
          <span class="order-value">${order.name || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Email</span>
          <span class="order-value">${order.email || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Phone</span>
          <span class="order-value">${order.phone || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Address</span>
          <span class="order-value">${order.address || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Items</span>
          <span class="order-value">${items}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Payment</span>
          <span class="order-value">${order.payment_method || 'N/A'}</span>
        </div>
        <div class="order-detail">
          <span class="order-label">Amount</span>
          <span class="order-value order-amount">₦${Number(order.amount).toLocaleString()}</span>
        </div>
      </div>
      <div class="order-actions">
        ${!isArchived ? `
        <select class="status-select" data-order-id="${order.id}">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
          <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button class="btn-update-status" data-order-id="${order.id}">Update Status</button>
        ` : ''}
        <button class="btn-archive ${isArchived ? 'btn-unarchive' : ''}" data-order-id="${order.id}" data-archived="${isArchived}">
          ${isArchived ? '↩ Restore' : '📦 Archive'}
        </button>
        <button class="btn-delete-order" data-order-id="${order.id}">🗑 Delete</button>
      </div>
    `;
    list.appendChild(row);
  });

  attachOrderListeners();
}

function attachOrderListeners() {
  // Update status
  document.querySelectorAll('.btn-update-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.orderId;
      const select = document.querySelector(`.status-select[data-order-id="${orderId}"]`);
      const status = select.value;

      try {
        const res = await fetch(`${API}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status })
        });

        if (res.ok) {
          btn.textContent = '✓ Updated!';
          btn.style.color = '#4caf7d';
          setTimeout(() => {
            btn.textContent = 'Update Status';
            btn.style.color = '';
            loadOrders();
          }, 1500);
        }
      } catch (err) {
        console.error('Status update error:', err);
      }
    });
  });

  // Archive / Restore
  document.querySelectorAll('.btn-archive').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.orderId;
      const isArchived = btn.dataset.archived === 'true';
      const action = isArchived ? 'restore' : 'archive';

      if (!confirm(`${isArchived ? 'Restore' : 'Archive'} this order?`)) return;

      try {
        const res = await fetch(`${API}/orders/${orderId}/archive`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ archived: !isArchived })
        });

        if (res.ok) loadOrders();
        else alert(`Failed to ${action} order.`);
      } catch (err) {
        console.error('Archive error:', err);
      }
    });
  });

  // Delete order permanently
  document.querySelectorAll('.btn-delete-order').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.orderId;
      if (!confirm('Permanently delete this order? This cannot be undone.')) return;

      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) loadOrders();
        else alert('Failed to delete order.');
      } catch (err) {
        console.error('Delete order error:', err);
      }
    });
  });
}

// =====================
// EVENT LISTENERS
// =====================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('addProductBtn').addEventListener('click', addProduct);
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
  document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
  document.getElementById('productsTab').addEventListener('click', () => switchTab('products'));
  document.getElementById('ordersTab').addEventListener('click', () => switchTab('orders'));

  document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') {
      login();
    }
  });

  if (token) showAdmin();
});