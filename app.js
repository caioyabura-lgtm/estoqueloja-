const API = 'https://script.google.com/macros/s/AKfycbxYBBNIIYHWLd-ZLt8hHoYz6evdznEpDVAR6txvTjDSvBCO7U5zsUq-Z1zl1FNayioA/exec

async function getProducts() {
  const res = await fetch(API + '?action=products');
  const data = await res.json();

  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  data.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.nome} | ${p.codigo} | estoque: ${p.estoque}`;
    lista.appendChild(li);
  });
}

document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd);

  await fetch(API, {
    method: 'POST',
    body: JSON.stringify({
      action: 'createProduct',
      payload
    })
  });

  e.target.reset();
  getProducts();
});

document.getElementById('formMov').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd);

  await fetch(API, {
    method: 'POST',
    body: JSON.stringify({
      action: 'moveStock',
      payload
    })
  });

  e.target.reset();
  getProducts();
});

getProducts();