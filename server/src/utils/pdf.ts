import { Response } from 'express';
import PDFDocument from 'pdfkit';

type Party = {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

type PurchaseOrderPdfLine = {
  item?: {
    name?: string;
    sku?: string;
  };
  quantity: number;
  cost: number;
};

type SalesOrderPdfLine = {
  item?: {
    name?: string;
    sku?: string;
  };
  quantity: number;
  price: number;
};

type PurchaseOrderPdfData = {
  _id: string;
  status: string;
  supplier?: Party | null;
  items?: PurchaseOrderPdfLine[];
  paymentTerms?: string;
  deliveryDate?: Date | string;
  taxRate?: number;
  shippingAddress?: string;
  expectedDate?: Date | string;
  receivedDate?: Date | string;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type SalesOrderPdfData = {
  _id: string;
  status: string;
  customer?: Party | null;
  items?: SalesOrderPdfLine[];
  paymentTerms?: string;
  deliveryDate?: Date | string;
  approvedDate?: Date | string;
  receivedDate?: Date | string;
  taxRate?: number;
  shippingAddress?: string;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const formatDate = (value?: Date | string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().slice(0, 10);
};

const DEFAULT_FONT_PATHS = ['C:\\Windows\\Fonts\\segoeui.ttf', 'C:\\Windows\\Fonts\\seguisym.ttf'];
const formatMoney = (value: number) => `₹${value.toFixed(2)}`;
const GST_RATE = 0.18;

const startPdf = (res: Response, filename: string) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);
  for (const fontPath of DEFAULT_FONT_PATHS) {
    try {
      doc.font(fontPath);
      break;
    } catch {
      // Try next font
    }
  }
  return doc;
};

const drawBlockTitle = (
  doc: PDFKit.PDFDocument,
  title: string,
  x: number,
  y: number,
  width: number
) => {
  doc.fillColor('#0B2E59').fontSize(11).text(title, x, y, { width });
  doc.fillColor('black');
};

const drawKeyValue = (
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) => {
  doc.fontSize(9).fillColor('#3B4A5A').text(label, x, y, { width });
  doc.fillColor('black').text(value || '-', x, y + 12, { width });
};

const buildPartyText = (party?: Party | null) => {
  if (!party) return '-';
  return [
    party.name || '-',
    party.contactName ? `Contact: ${party.contactName}` : null,
    party.phone ? `Phone: ${party.phone}` : null,
    party.email ? `Email: ${party.email}` : null,
    party.address ? `Address: ${party.address}` : null
  ]
    .filter(Boolean)
    .join('\n');
};

const drawSimpleTable = (
  doc: PDFKit.PDFDocument,
  columns: TableColumn[],
  rows: string[][],
  startX: number,
  startY: number,
  rowHeight: number
) => {
  const drawHeader = () => {
    const headerY = doc.y;
    drawTableHeader(doc, columns, startX, headerY, rowHeight);
    doc.y = headerY + rowHeight + 6;
  };

  drawHeader();
  let y = doc.y;
  rows.forEach((row, index) => {
    y = ensureTableSpace(doc, y, rowHeight, drawHeader);
    drawTableRow(doc, columns, startX, y, rowHeight, row, index % 2 === 0);
    y += rowHeight;
  });
  doc.y = y;
};

const drawHeaderBlock = (
  doc: PDFKit.PDFDocument,
  title: string,
  leftX: number,
  topY: number,
  pageWidth: number
) => {
  const logoBox = { x: leftX, y: topY, w: 90, h: 50 };
  doc.strokeColor('#CBD5E1').rect(logoBox.x, logoBox.y, logoBox.w, logoBox.h).stroke();
  doc
    .fontSize(9)
    .fillColor('#64748B')
    .text('Logo', logoBox.x, logoBox.y + 18, { width: logoBox.w, align: 'center' });
  doc.fillColor('black');

  const titleX = leftX + logoBox.w + 12;
  doc.fillColor('#0B2E59').fontSize(20).text(title, titleX, topY + 4, {
    align: 'left'
  });
  doc.fillColor('black');

  const addressX = leftX + pageWidth * 0.6;
  const addressW = pageWidth * 0.4;
  doc.fillColor('#0B2E59').fontSize(10).text('Company Name', addressX, topY);
  doc.fillColor('#334155').fontSize(9).text(
    'Address Line 1\nAddress Line 2\nCity, State, PIN\nPhone: +91-XXXXXXXXXX\nEmail: info@company.com',
    addressX,
    topY + 14,
    { width: addressW }
  );
  doc.fillColor('black');

  doc.moveDown(1.6);
};

const drawPartyBlock = (
  doc: PDFKit.PDFDocument,
  title: string,
  party: Party | null | undefined,
  x: number,
  y: number,
  width: number
) => {
  drawBlockTitle(doc, title, x, y, width);
  const startY = y + 18;
  doc.fontSize(9).text(buildPartyText(party), x, startY, { width });
};

type TableColumn = {
  label: string;
  width: number;
  align?: PDFKit.Mixins.TextOptions['align'];
};

const drawTableHeader = (
  doc: PDFKit.PDFDocument,
  columns: TableColumn[],
  startX: number,
  startY: number,
  rowHeight: number
) => {
  let x = startX;
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  doc.save();
  doc.fillColor('#E6F2FF').rect(startX, startY, totalWidth, rowHeight).fill();
  doc.restore();
  doc.strokeColor('#D1D5DB').rect(startX, startY, totalWidth, rowHeight).stroke();
  doc.fillColor('#0B2E59');
  columns.forEach((col) => {
    doc.text(col.label, x + 4, startY + 6, { width: col.width - 8, align: col.align ?? 'left' });
    x += col.width;
  });
  doc.fillColor('black');
};

const ensureTableSpace = (
  doc: PDFKit.PDFDocument,
  nextRowY: number,
  rowHeight: number,
  drawHeader: () => void
) => {
  if (nextRowY + rowHeight > doc.page.height - doc.page.margins.bottom - 20) {
    doc.addPage();
    drawHeader();
    return doc.y;
  }
  return nextRowY;
};

const drawTableRow = (
  doc: PDFKit.PDFDocument,
  columns: TableColumn[],
  startX: number,
  startY: number,
  rowHeight: number,
  values: string[],
  isStriped: boolean
) => {
  let x = startX;
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  if (isStriped) {
    doc.save();
    doc.fillColor('#F6F9FC').rect(startX, startY, totalWidth, rowHeight).fill();
    doc.restore();
  }
  doc.strokeColor('#E5E7EB').rect(startX, startY, totalWidth, rowHeight).stroke();
  columns.forEach((col, index) => {
    doc.text(values[index] ?? '-', x + 4, startY + 6, {
      width: col.width - 8,
      align: col.align ?? 'left'
    });
    x += col.width;
    doc.strokeColor('#E5E7EB').moveTo(x, startY).lineTo(x, startY + rowHeight).stroke();
  });
  doc.fillColor('black');
};

export const streamPurchaseOrderPdf = (res: Response, order: PurchaseOrderPdfData) => {
  const doc = startPdf(res, `purchase-order-${order._id}.pdf`);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const leftX = doc.page.margins.left;
  const rightX = doc.page.margins.left + pageWidth / 2 + 10;
  const columnWidth = pageWidth / 2 - 10;

  drawHeaderBlock(doc, 'Purchase Order', leftX, doc.y, pageWidth);

  const headerRowHeight = 90;
  const infoColumns: TableColumn[] = [
    { label: 'Supplier Details', width: pageWidth / 2 },
    { label: 'Order Details', width: pageWidth / 2 }
  ];
  const orderDetailsText = [
    `Order ID: ${order._id}`,
    `Status: ${order.status}`,
    `Created: ${formatDate(order.createdAt)}`,
    `Expected: ${formatDate(order.expectedDate)}`,
    `Delivery: ${formatDate(order.deliveryDate)}`,
    `Payment Terms: ${order.paymentTerms ?? '-'}`,
    `Shipping: ${order.shippingAddress ?? '-'}`,
    `Received: ${formatDate(order.receivedDate)}`
  ].join('\n');
  drawSimpleTable(
    doc,
    infoColumns,
    [[buildPartyText(order.supplier), orderDetailsText]],
    leftX,
    doc.y,
    headerRowHeight
  );
  doc.fillColor('#0B2E59').fontSize(12).text('Items', leftX);
  doc.fillColor('black');
  doc.moveDown(0.4);

  const tableWidth = pageWidth;
  const columns: TableColumn[] = [
    { label: 'Item', width: tableWidth * 0.38 },
    { label: 'SKU', width: tableWidth * 0.14 },
    { label: 'Qty', width: tableWidth * 0.12, align: 'right' },
    { label: 'Unit Cost', width: tableWidth * 0.18, align: 'right' },
    { label: 'Line Total', width: tableWidth * 0.18, align: 'right' }
  ];

  const tableStartX = doc.page.margins.left;
  const rowHeight = 22;
  let y = doc.y;
  const drawHeader = () => {
    const headerY = doc.y;
    drawTableHeader(doc, columns, tableStartX, headerY, rowHeight);
    doc.y = headerY + rowHeight + 6;
  };
  drawHeader();
  y = doc.y;

  let subtotal = 0;
  (order.items ?? []).forEach((line, index) => {
    const lineTotal = line.quantity * line.cost;
    subtotal += lineTotal;
    y = ensureTableSpace(doc, y, rowHeight, drawHeader);
    drawTableRow(
      doc,
      columns,
      tableStartX,
      y,
      rowHeight,
      [
        line.item?.name ?? '-',
        line.item?.sku ?? '-',
        String(line.quantity),
        formatMoney(line.cost),
        formatMoney(lineTotal)
      ],
      index % 2 === 0
    );
    y += rowHeight;
  });

  const taxRate = typeof order.taxRate === 'number' ? order.taxRate : GST_RATE;
  const gstAmount = subtotal * taxRate;
  const grandTotal = subtotal + gstAmount;

  doc.moveDown(1.2);
  const gstColumns: TableColumn[] = [
    { label: 'GST / Tax Summary', width: pageWidth * 0.7 },
    { label: 'Amount', width: pageWidth * 0.3, align: 'right' }
  ];
  drawSimpleTable(
    doc,
    gstColumns,
    [
      ['Subtotal', formatMoney(subtotal)],
      [`GST (${(taxRate * 100).toFixed(0)}%)`, formatMoney(gstAmount)],
      ['Total', formatMoney(grandTotal)]
    ],
    leftX,
    doc.y,
    22
  );

  if (order.notes) {
    doc.moveDown();
    doc.fontSize(11).text('Notes');
    doc.fontSize(10).text(order.notes);
  }

  doc.moveDown(2);
  const signY = doc.y;
  const signWidth = pageWidth / 2 - 20;
  doc.strokeColor('#94A3B8').moveTo(leftX, signY + 20).lineTo(leftX + signWidth, signY + 20).stroke();
  doc.strokeColor('#94A3B8')
    .moveTo(leftX + signWidth + 40, signY + 20)
    .lineTo(leftX + signWidth + 40 + signWidth, signY + 20)
    .stroke();
  doc.fillColor('#334155').fontSize(9).text('Prepared By', leftX, signY + 26, { width: signWidth });
  doc.text('Approved By', leftX + signWidth + 40, signY + 26, { width: signWidth });
  doc.fillColor('black');

  doc.end();
};

export const streamSalesOrderPdf = (res: Response, order: SalesOrderPdfData) => {
  const doc = startPdf(res, `sales-order-${order._id}.pdf`);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const leftX = doc.page.margins.left;
  const rightX = doc.page.margins.left + pageWidth / 2 + 10;
  const columnWidth = pageWidth / 2 - 10;

  drawHeaderBlock(doc, 'Sales Order', leftX, doc.y, pageWidth);

  const headerRowHeight = 90;
  const infoColumns: TableColumn[] = [
    { label: 'Customer Details', width: pageWidth / 2 },
    { label: 'Order Details', width: pageWidth / 2 }
  ];
  const orderDetailsText = [
    `Order ID: ${order._id}`,
    `Status: ${order.status}`,
    `Created: ${formatDate(order.createdAt)}`,
    `Approved: ${formatDate(order.approvedDate)}`,
    `Received: ${formatDate(order.receivedDate)}`,
    `Delivery: ${formatDate(order.deliveryDate)}`,
    `Payment Terms: ${order.paymentTerms ?? '-'}`,
    `Shipping: ${order.shippingAddress ?? '-'}`
  ].join('\n');
  drawSimpleTable(
    doc,
    infoColumns,
    [[buildPartyText(order.customer), orderDetailsText]],
    leftX,
    doc.y,
    headerRowHeight
  );
  doc.fillColor('#0B2E59').fontSize(12).text('Items', leftX);
  doc.fillColor('black');
  doc.moveDown(0.4);

  const tableWidth = pageWidth;
  const columns: TableColumn[] = [
    { label: 'Item', width: tableWidth * 0.38 },
    { label: 'SKU', width: tableWidth * 0.14 },
    { label: 'Qty', width: tableWidth * 0.12, align: 'right' },
    { label: 'Unit Price', width: tableWidth * 0.18, align: 'right' },
    { label: 'Line Total', width: tableWidth * 0.18, align: 'right' }
  ];

  const tableStartX = doc.page.margins.left;
  const rowHeight = 22;
  let y = doc.y;
  const drawHeader = () => {
    const headerY = doc.y;
    drawTableHeader(doc, columns, tableStartX, headerY, rowHeight);
    doc.y = headerY + rowHeight + 6;
  };
  drawHeader();
  y = doc.y;

  let subtotal = 0;
  (order.items ?? []).forEach((line, index) => {
    const lineTotal = line.quantity * line.price;
    subtotal += lineTotal;
    y = ensureTableSpace(doc, y, rowHeight, drawHeader);
    drawTableRow(
      doc,
      columns,
      tableStartX,
      y,
      rowHeight,
      [
        line.item?.name ?? '-',
        line.item?.sku ?? '-',
        String(line.quantity),
        formatMoney(line.price),
        formatMoney(lineTotal)
      ],
      index % 2 === 0
    );
    y += rowHeight;
  });

  const taxRate = typeof order.taxRate === 'number' ? order.taxRate : GST_RATE;
  const gstAmount = subtotal * taxRate;
  const grandTotal = subtotal + gstAmount;

  doc.moveDown(1.2);
  const gstColumns: TableColumn[] = [
    { label: 'GST / Tax Summary', width: pageWidth * 0.7 },
    { label: 'Amount', width: pageWidth * 0.3, align: 'right' }
  ];
  drawSimpleTable(
    doc,
    gstColumns,
    [
      ['Subtotal', formatMoney(subtotal)],
      [`GST (${(taxRate * 100).toFixed(0)}%)`, formatMoney(gstAmount)],
      ['Total', formatMoney(grandTotal)]
    ],
    leftX,
    doc.y,
    22
  );

  if (order.notes) {
    doc.moveDown();
    doc.fontSize(11).text('Notes');
    doc.fontSize(10).text(order.notes);
  }

  doc.moveDown(2);
  const signY = doc.y;
  const signWidth = pageWidth / 2 - 20;
  doc.strokeColor('#94A3B8').moveTo(leftX, signY + 20).lineTo(leftX + signWidth, signY + 20).stroke();
  doc.strokeColor('#94A3B8')
    .moveTo(leftX + signWidth + 40, signY + 20)
    .lineTo(leftX + signWidth + 40 + signWidth, signY + 20)
    .stroke();
  doc.fillColor('#334155').fontSize(9).text('Prepared By', leftX, signY + 26, { width: signWidth });
  doc.text('Approved By', leftX + signWidth + 40, signY + 26, { width: signWidth });
  doc.fillColor('black');

  doc.end();
};
