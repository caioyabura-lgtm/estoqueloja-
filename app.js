const API = 'https://script.google.com/macros/s/AKfycbwHlpmx-4FHFJut4Ss_5t1cQQc6OPomHqbtGkrhLLfIgTa4HwtGcQVb2VqEJeIeu2Gi/exec

async function apiGet(action, params = {}) {
  const url = new URL(API);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });

  const res = await fetch(url);
  return res.json();
}

// 👇 CORREÇÃO PRINCIPAL AQUI
async function apiPost(action, payload) {
  const res = await fetch(API, {
    method: 'POST',
    mode: 'no-cors', // 👈 necessário pro GitHub Pages
    body: JSON.stringify({ action, payload })
  });

  return { ok: true };
}

// TESTE RÁPIDO
async function test() {
  const data = await apiGet('products');
  console.log(data);
}

test();