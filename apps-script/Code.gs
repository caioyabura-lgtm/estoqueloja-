const SHEET_ID = 'https://script.google.com/macros/s/AKfycbxYBBNIIYHWLd-ZLt8hHoYz6evdznEpDVAR6txvTjDSvBCO7U5zsUq-Z1zl1FNayioA/exec'

function doGet(e) {
  const action = e?.parameter?.action || '';

  if (action === 'products') {
    return json(getProducts());
  }

  if (action === 'productByBarcode') {
    return json(getProductByBarcode(e.parameter.barcode));
  }

  return json([]);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  if (body.action === 'createProduct') {
    return json(createProduct(body.payload));
  }

  if (body.action === 'moveStock') {
    return json(moveStock(body.payload));
  }

  return json({ error: 'ação inválida' });
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function getProducts() {
  const s = sheet('produtos');
  const values = s.getDataRange().getValues();
  const headers = values[0];

  return values.slice(1).map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function getProductByBarcode(code) {
  const list = getProducts();
  return list.find(p => String(p.codigo) === String(code)) || null;
}

function createProduct(p) {
  const s = sheet('produtos');

  s.appendRow([
    Utilities.getUuid(),
    p.nome,
    p.codigo,
    p.categoria,
    p.tamanho,
    p.cor,
    Number(p.preco || 0),
    Number(p.estoque || 0),
    Number(p.minimo || 0)
  ]);

  return { ok: true };
}

function moveStock(p) {
  const s = sheet('produtos');
  const m = sheet('movimentacoes');

  const values = s.getDataRange().getValues();
  const headers = values[0];

  const codigoCol = headers.indexOf('codigo');
  const estoqueCol = headers.indexOf('estoque');

  for (let i = 1; i < values.length; i++) {
    if (values[i][codigoCol] == p.codigo) {
      let estoque = Number(values[i][estoqueCol]);

      if (p.tipo === 'entrada') estoque += Number(p.quantidade);
      if (p.tipo === 'saida') estoque -= Number(p.quantidade);

      s.getRange(i + 1, estoqueCol + 1).setValue(estoque);

      m.appendRow([
        new Date(),
        p.tipo,
        p.codigo,
        p.quantidade,
        estoque
      ]);

      return { estoque };
    }
  }

  throw new Error('Produto não encontrado');
}