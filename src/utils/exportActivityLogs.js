import * as XLSX from 'xlsx';

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

const exportActivityLogs = (logs = []) => {
  const safeLogs = Array.isArray(logs) ? logs : [];

  const worksheetData = safeLogs.map((log) => ({
    Action: log?.action ?? '',
    Type: log?.type ?? '',
    User: log?.user ?? '',
    'User ID': log?.userId ?? '',
    Timestamp: formatTimestamp(log?.timestamp),
    Details: formatDetails(log?.details),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
    header: ['Action', 'Type', 'User', 'User ID', 'Timestamp', 'Details'],
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity Logs');

  XLSX.writeFile(workbook, 'activity-logs.xlsx');

  return workbook;
};

export default exportActivityLogs;
