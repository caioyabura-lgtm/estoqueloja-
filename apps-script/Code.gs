const SHEET_ID = '1pI1_-plyUii8QfxRzWZ39ExZ89orCh4DQzMQHlIDXJU'

function doGet(e) {
  const action = e?.parameter?.action || '';

  if (action === 'products') {
    return output({ ok: true, data: getProducts() });
  }

  if (action === 'productByBarcode') {
    const barcode = e?.parameter?.barcode || '';
    return output({ ok: true, data: getProductByBarcode(barcode) });
  }

  return output({ ok: false });
}

// 👇 CORREÇÃO PRINCIPAL AQUI
function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');

  if (body.action === 'createProduct') {
    createProduct(body.payload);
    return output({ ok: true });
  }

  if (body.action === 'moveStock') {
    const result = moveStock(body.payload);
    return output({ ok: true, data: result });
  }

  return output({ ok: false });
}

function output(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function getProducts() {
  const s = getSheet('produtos');
  const v = s.getDataRange().getValues();
  if (v.length < 2) return [];

  const h = v[0];

  return v.slice(1).map(r => {
    let o = {};
    h.forEach((k, i) => o[k] = r[i]);
    return o;
  });
}

function getProductByBarcode(code) {
  const list = getProducts();
  return list.find(p => String(p.codigo) === String(code)) || null;
}

function createProduct(p) {
  const s = getSheet('produtos');

  s.appendRow([
    Utilities.getUuid(),
    p.nome || '',
    p.codigo || '',
    p.categoria || '',
    p.tamanho || '',
    p.cor || '',
    Number(p.preco || 0),
    Number(p.estoque || 0),
    Number(p.minimo || 0)
  ]);
}

function moveStock(p) {
  const s = getSheet('produtos');
  const m = getSheet('movimentacoes');

  const v = s.getDataRange().getValues();
  const h = v[0];

  const codigoCol = h.indexOf('codigo');
  const estoqueCol = h.indexOf('estoque');

  for (let i = 1; i < v.length; i++) {
    if (String(v[i][codigoCol]) === String(p.codigo)) {

      let estoque = Number(v[i][estoqueCol]);

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

      return { estoqueDepois: estoque };
    }
  }

  throw new Error('Produto não encontrado');
}