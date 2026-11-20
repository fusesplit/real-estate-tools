import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const receiptNoEl = document.getElementById('receiptNo');
const paymentDateEl = document.getElementById('paymentDate');
const landlordNameEl = document.getElementById('landlordName');
const tenantNameEl = document.getElementById('tenantName');
const propertyAddressEl = document.getElementById('propertyAddress');
const periodFromEl = document.getElementById('periodFrom');
const periodToEl = document.getElementById('periodTo');
const rentAmountEl = document.getElementById('rentAmount');
const lateFeeEl = document.getElementById('lateFee');
const paymentMethodEl = document.getElementById('paymentMethod');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updatePreview() {
  const symbol = currencyEl.value;
  const rent = Math.max(0, parseFloat(rentAmountEl.value) || 0);
  const lateFee = Math.max(0, parseFloat(lateFeeEl.value) || 0);
  const total = rent + lateFee;

  document.getElementById('totalPaidDisplay').textContent = formatMoney(total, symbol);
  document.getElementById('previewTenant').textContent = tenantNameEl.value || 'Tenant Name';
  document.getElementById('previewLandlord').textContent = landlordNameEl.value || 'Landlord Name';
  document.getElementById('previewAddress').textContent = propertyAddressEl.value || 'Property Address';
  document.getElementById('previewMethod').textContent = paymentMethodEl.value;

  return {
    symbol,
    receiptNo: receiptNoEl.value || 'REC-001',
    paymentDate: paymentDateEl.value || new Date().toLocaleDateString(),
    landlord: landlordNameEl.value || 'Landlord / Property Manager',
    tenant: tenantNameEl.value || 'Tenant',
    address: propertyAddressEl.value || 'Rental Property Address',
    periodFrom: periodFromEl.value || 'Start Date',
    periodTo: periodToEl.value || 'End Date',
    rent,
    lateFee,
    total,
    method: paymentMethodEl.value
  };
}

function generatePDF() {
  const data = updatePreview();
  const doc = new jsPDF();

  // Top Banner
  doc.setFontSize(22);
  doc.setTextColor('#059669');
  doc.text('OFFICIAL RENT RECEIPT', 14, 24);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Receipt #: ' + data.receiptNo, 150, 18);
  doc.text('Date Paid: ' + data.paymentDate, 150, 24);

  // Landlord & Tenant Details
  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.setFont(undefined, 'bold');
  doc.text('Received From (Tenant):', 14, 42);
  doc.setFont(undefined, 'normal');
  doc.text(data.tenant, 14, 48);

  doc.setFont(undefined, 'bold');
  doc.text('Received By (Landlord):', 110, 42);
  doc.setFont(undefined, 'normal');
  doc.text(data.landlord, 110, 48);

  doc.setFont(undefined, 'bold');
  doc.text('Rental Property Address:', 14, 62);
  doc.setFont(undefined, 'normal');
  doc.text(data.address, 14, 68);

  doc.setFont(undefined, 'bold');
  doc.text('Rental Period Covered:', 14, 80);
  doc.setFont(undefined, 'normal');
  doc.text(data.periodFrom + '  to  ' + data.periodTo, 14, 86);

  // Payment Breakdown Table
  autoTable(doc, {
    startY: 96,
    head: [['Description', 'Payment Method', 'Amount']],
    body: [
      ['Monthly Rent Payment', data.method, formatMoney(data.rent, data.symbol)],
      ['Late Fee / Additional Charges', '-', formatMoney(data.lateFee, data.symbol)],
      ['TOTAL AMOUNT PAID', data.method, formatMoney(data.total, data.symbol)]
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  // Signature Line
  const finalY = doc.lastAutoTable.finalY + 25;
  doc.setDrawColor('#94a3b8');
  doc.line(14, finalY, 95, finalY);
  doc.setFontSize(9);
  doc.setTextColor('#475569');
  doc.text('Landlord / Authorized Agent Signature', 14, finalY + 5);

  doc.line(115, finalY, 195, finalY);
  doc.text('Date Signed', 115, finalY + 5);

  doc.save('rent-receipt-' + data.receiptNo + '.pdf');
}

[
  currencyEl, receiptNoEl, paymentDateEl, landlordNameEl,
  tenantNameEl, propertyAddressEl, periodFromEl, periodToEl,
  rentAmountEl, lateFeeEl, paymentMethodEl
].forEach((el) => {
  el.addEventListener('input', updatePreview);
});

downloadBtn.addEventListener('click', generatePDF);
updatePreview();
