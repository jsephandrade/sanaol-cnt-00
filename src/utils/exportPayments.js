import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const formatDateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
};

const toCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(2);
};

const buildFileName = () => {
  const now = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
    now.getSeconds()
  )}`;
  return `payments-${datePart}-${timePart}.xlsx`;
};

const exportPayments = async (payments = []) => {
  const rows = Array.isArray(payments) ? payments : [];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payments');

  worksheet.columns = [
    { header: 'Order', key: 'order', width: 18 },
    { header: 'Order Ref', key: 'orderRef', width: 18 },
    { header: 'Date', key: 'date', width: 24 },
    { header: 'Method', key: 'method', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Customer', key: 'customer', width: 24 },
  ];

  rows.forEach((p) => {
    worksheet.addRow({
      order: p.orderNumber || p.orderReference || p.orderId || '',
      orderRef: p.orderReference || p.orderNumber || '',
      date: formatDateValue(p.date || p.timestamp),
      method: p.method || '',
      amount: toCurrency(p.amount),
      status: p.status || '',
      customer: p.customer || p.reference || '',
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8E8E8' },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, buildFileName());
};

export default exportPayments;
