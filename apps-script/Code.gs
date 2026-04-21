const SHEET_NAME = "Produtos";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "ok",
      message: "API do Estoque Atelie ativa",
      timestamp: new Date().toISOString(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function listProducts() {
  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headers = values[0];
  return values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

function saveProduct(product) {
  const sheet = getOrCreateSheet_();
  const payload = normalizeProduct_(product);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "id",
      "name",
      "barcode",
      "category",
      "size",
      "color",
      "price",
      "stock",
      "minimum",
      "notes",
      "updatedAt",
    ]);
  }

  sheet.appendRow([
    payload.id,
    payload.name,
    payload.barcode,
    payload.category,
    payload.size,
    payload.color,
    payload.price,
    payload.stock,
    payload.minimum,
    payload.notes,
    payload.updatedAt,
  ]);

  return {
    status: "saved",
    product: payload,
  };
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function normalizeProduct_(product) {
  const input = product || {};

  return {
    id: input.id || Utilities.getUuid(),
    name: input.name || "",
    barcode: input.barcode || "",
    category: input.category || "",
    size: input.size || "",
    color: input.color || "",
    price: Number(input.price || 0),
    stock: Number(input.stock || 0),
    minimum: Number(input.minimum || 0),
    notes: input.notes || "",
    updatedAt: new Date().toISOString(),
  };
}
