import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const noticeDateEl = document.getElementById('noticeDate');
const landlordNameEl = document.getElementById('landlordName');
const landlordContactEl = document.getElementById('landlordContact');
const tenantNameEl = document.getElementById('tenantName');
const propertyAddressEl = document.getElementById('propertyAddress');
const pastDueRentEl = document.getElementById('pastDueRent');
const lateFeeEl = document.getElementById('lateFee');
const originalDueDateEl = document.getElementById('originalDueDate');
const graceDaysEl = document.getElementById('graceDays');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateNoticePreview() {
  const symbol = currencyEl.value;
  const rent = Math.max(0, parseFloat(pastDueRentEl.value) || 0);
  const fee = Math.max(0, parseFloat(lateFeeEl.value) || 0);
  const totalDue = rent + fee;

  document.getElementById('totalDueDisplay').textContent = formatMoney(totalDue, symbol);
  document.getElementById('previewTenant').textContent = tenantNameEl.value || 'Tenant Name';
  document.getElementById('previewDueDate').textContent = originalDueDateEl.value || 'Due Date';
  document.getElementById('previewGrace').textContent = (graceDaysEl.value || '5') + ' Days';

  return {
    symbol,
    noticeDate: noticeDateEl.value || new Date().toLocaleDateString(),
    landlord: landlordNameEl.value || '[Landlord Name]',
    contact: landlordContactEl.value || '[Landlord Phone / Email]',
    tenant: tenantNameEl.value || '[Tenant Name]',
    address: propertyAddressEl.value || '[Rental Property Address]',
    rent,
    fee,
    totalDue,
    originalDueDate: originalDueDateEl.value || 'the scheduled due date',
    graceDays: graceDaysEl.value || '5'
  };
}

function generatePDF() {
  const data = updateNoticePreview();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#dc2626');
  doc.text('NOTICE OF PAST DUE RENT', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Date of Notice: ' + data.noticeDate, 14, 29);

  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.text('TO TENANT: ' + data.tenant, 14, 42);
  doc.text('PREMISES: ' + data.address, 14, 49);

  const bodyText = `Dear ${data.tenant},\n\nThis is a formal reminder that your rent payment due on ${data.originalDueDate} has not yet been received. Pursuant to your Residential Lease Agreement, please remit the total past-due balance detailed below within ${data.graceDays} days of this notice to avoid further legal action or additional late penalties.`;
  const lines = doc.splitTextToSize(bodyText, 180);
  doc.text(lines, 14, 62);

  autoTable(doc, {
    startY: 96,
    head: [['Past-Due Balance Item', 'Amount']],
    body: [
      ['Unpaid Rent Balance', formatMoney(data.rent, data.symbol)],
      ['Applicable Late Fee', formatMoney(data.fee, data.symbol)],
      ['TOTAL AMOUNT DUE IMMEDIATELY', formatMoney(data.totalDue, data.symbol)]
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  const finalY = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(10);
  doc.text('Please submit payment promptly or contact Landlord at: ' + data.contact, 14, finalY);

  doc.line(14, finalY + 24, 95, finalY + 24);
  doc.setFontSize(9);
  doc.text('Landlord / Authorized Agent: ' + data.landlord, 14, finalY + 29);

  doc.save('late-rent-notice.pdf');
}

[
  currencyEl, noticeDateEl, landlordNameEl, landlordContactEl,
  tenantNameEl, propertyAddressEl, pastDueRentEl, lateFeeEl,
  originalDueDateEl, graceDaysEl
].forEach((el) => {
  el.addEventListener('input', updateNoticePreview);
});

downloadBtn.addEventListener('click', generatePDF);
updateNoticePreview();
