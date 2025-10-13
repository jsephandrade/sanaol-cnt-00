import ExcelJS from 'exceljs';

const formatDetails = (details) => {
  if (details == null) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch (error) {
    return String(details);
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toISOString();
};

const exportActivityLogs = async (logs = []) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const safeLogs = Array.isArray(logs) ? logs : [];

  const worksheetData = safeLogs.map((log) => ({
    Action: log?.action ?? '',
    Type: log?.type ?? '',
    User: log?.user ?? '',
    'User ID': log?.userId ?? '',
    Timestamp: formatTimestamp(log?.timestamp),
    Details: formatDetails(log?.details),
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Activity Logs', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  worksheet.columns = [
    { header: 'Action', key: 'Action', width: 32 },
    { header: 'Type', key: 'Type', width: 18 },
    { header: 'User', key: 'User', width: 24 },
    { header: 'User ID', key: 'User ID', width: 18 },
    { header: 'Timestamp', key: 'Timestamp', width: 28 },
    { header: 'Details', key: 'Details', width: 40 },
  ];

  worksheetData.forEach((row) => {
    worksheet.addRow(row);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'activity-logs.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
};

export default exportActivityLogs;
