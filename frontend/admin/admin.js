const API = 'http://localhost:3000';
let token = localStorage.getItem('adminToken');

const CATEGORIES = [
  'Greek Yogurt Fruit Parfait',
  'Fruit Salad Mix',
  'Fruit Juice',
  'Tasty Yogurt'
];

const FRUIT_EMOJIS = {
  'orange': '🍊',
  'pineapple': '🍍',
  'watermelon': '🍉',
  'mango': '🥭',
  'banana': '🍌',
  'grape': '🍇',
  'strawberry': '🍓',
  'apple': '🍎',
  'yogurt': '🥛',
  'default': '🍽️'
};

function getEmoji(name) {
  const lower = name.toLowerCase();
  for (const key in FRUIT_EMOJIS) {
    if (lower.includes(key)) return FRUIT_EMOJIS[key];
  }
  return FRUIT_EMOJIS['default'];
}

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

    // Group by category
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
              data-id="${p.id}"
              data-name="${p.name}"
              data-price="${p.price}"
              data-desc="${p.description || ''}"
              data-image="${p.image || ''}"
              data-category="${p.category}">Edit</button>
            <button class="btn-danger" data-id="${p.id}">Delete</button>
          </div>
        `;
        section.appendChild(item);
      });

      list.appendChild(section);
    });

    // Uncategorized products
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
              data-id="${p.id}"
              data-name="${p.name}"
              data-price="${p.price}"
              data-desc="${p.description || ''}"
              data-image="${p.image || ''}"
              data-category="${p.category || ''}">Edit</button>
            <button class="btn-danger" data-id="${p.id}">Delete</button>
          </div>
        `;
        section.appendChild(item);
      });
      list.appendChild(section);
    }

    // Attach edit and delete listeners after rendering
    attachProductListeners();

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

function attachProductListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      openEdit(
        btn.dataset.id,
        btn.dataset.name,
        btn.dataset.price,
        btn.dataset.desc,
        btn.dataset.image,
        btn.dataset.category
      );
    });
  });

  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteProduct(btn.dataset.id);
    });
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
// ALL EVENT LISTENERS
// =====================
document.addEventListener('DOMContentLoaded', () => {

  // Login button
  document.getElementById('loginBtn').addEventListener('click', login);

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Add product button
  document.getElementById('addProductBtn').addEventListener('click', addProduct);

  // Save edit button
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

  // Cancel edit button
  document.getElementById('cancelEditBtn').addEventListener('click', closeModal);

  // Close modal when clicking outside
  document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // Login on Enter key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') {
      login();
    }
  });

  // Check if already logged in
  if (token) showAdmin();
});