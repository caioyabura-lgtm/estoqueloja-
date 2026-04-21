const API_URL = 'https://script.google.com/macros/s/AKfycbzAtLWQMHZEKrJKJ2vbFqOga_0EAB9T6nPc0Ca8j6mlgaPa215Vg8x76rMA9FJKHOIf/exec

const productsTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');
const movementForm = document.getElementById('movementForm');
const movementFeedback = document.getElementById('movementFeedback');
const productSearch = document.getElementById('productSearch');
const labelForm = document.getElementById('labelForm');
const labelPreview = document.getElementById('labelPreview');
const printLabelBtn = document.getElementById('printLabelBtn');

let products = [];

async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url);
  return res.json();
}

async function apiPost(action, payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload })
  });
  return res.json();
}

async function loadProducts() {
  const result = await apiGet('products');
  if (!result.ok) return;

  products = result.data || [];
  renderProducts(products);
}

function renderProducts(list) {
  if (!list.length) {
    productsTableBody.innerHTML = `<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  productsTableBody.innerHTML = list.map(product => `
    <tr>
      <td>${escapeHtml(product.nome || '')}</td>
      <td>${escapeHtml(product.codigo || '')}</td>
      <td>${product.estoque ?? 0}</td>
      <td>${product.minimo ?? 0}</td>
      <td>R$ ${formatMoney(product.preco)}</td>
    </tr>
  `).join('');
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);
  const payload = Object.fromEntries(formData.entries());

  const result = await apiPost('createProduct', payload);
  if (result.ok) {
    productForm.reset();
    await loadProducts();
    alert('Produto salvo.');
  } else {
    alert(result.error || 'Erro ao salvar produto.');
  }
});

movementForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(movementForm);
  const payload = Object.fromEntries(formData.entries());

  const result = await apiPost('moveStock', payload);
  if (result.ok) {
    movementFeedback.textContent = `Movimentação registrada. Estoque atual: ${result.data.estoqueDepois}`;
    await loadProducts();
    movementForm.reset();
  } else {
    movementFeedback.textContent = result.error || 'Erro ao registrar movimentação.';
  }
});

productSearch.addEventListener('input', () => {
  const q = productSearch.value.trim().toLowerCase();
  const filtered = products.filter(product =>
    String(product.nome || '').toLowerCase().includes(q) ||
    String(product.codigo || '').toLowerCase().includes(q) ||
    String(product.categoria || '').toLowerCase().includes(q)
  );
  renderProducts(filtered);
});

labelForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const barcode = document.getElementById('labelBarcode').value.trim();
  const size = document.getElementById('labelSize').value;

  const result = await apiGet('productByBarcode', { barcode });
  if (!result.ok || !result.data) {
    labelPreview.innerHTML = 'Produto não encontrado.';
    return;
  }

  renderLabel(result.data, size);
});

printLabelBtn.addEventListener('click', () => {
  window.print();
});

function renderLabel(product, size) {
  labelPreview.innerHTML = `
    <div class="print-label size-${size}">
      <div class="label-name">${escapeHtml(product.nome || '')}</div>
      <div class="label-meta">
        ${escapeHtml(product.categoria || '')}
        ${product.tamanho ? ' | ' + escapeHtml(product.tamanho) : ''}
        ${product.cor ? ' | ' + escapeHtml(product.cor) : ''}
      </div>
      <div class="label-barcode">${escapeHtml(product.codigo || '')}</div>
      <div class="label-price">R$ ${formatMoney(product.preco)}</div>
    </div>
  `;
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2).replace('.', ',');
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadProducts();