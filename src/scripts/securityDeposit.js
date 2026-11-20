import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const tenantNameEl = document.getElementById('tenantName');
const landlordNameEl = document.getElementById('landlordName');
const propertyAddressEl = document.getElementById('propertyAddress');
const moveOutDateEl = document.getElementById('moveOutDate');
const initialDepositEl = document.getElementById('initialDeposit');

const ded1DescEl = document.getElementById('ded1Desc');
const ded1AmtEl = document.getElementById('ded1Amt');
const ded2DescEl = document.getElementById('ded2Desc');
const ded2AmtEl = document.getElementById('ded2Amt');
const ded3DescEl = document.getElementById('ded3Desc');
const ded3AmtEl = document.getElementById('ded3Amt');
const ded4DescEl = document.getElementById('ded4Desc');
const ded4AmtEl = document.getElementById('ded4Amt');
const ded5DescEl = document.getElementById('ded5Desc');
const ded5AmtEl = document.getElementById('ded5Amt');

const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateDeposit() {
  const symbol = currencyEl.value;
  const deposit = Math.max(0, parseFloat(initialDepositEl.value) || 0);

  const deductions = [
    { desc: ded1DescEl.value || 'Itemized Deduction 1', amt: Math.max(0, parseFloat(ded1AmtEl.value) || 0) },
    { desc: ded2DescEl.value || 'Itemized Deduction 2', amt: Math.max(0, parseFloat(ded2AmtEl.value) || 0) },
    { desc: ded3DescEl.value || 'Itemized Deduction 3', amt: Math.max(0, parseFloat(ded3AmtEl.value) || 0) },
    { desc: ded4DescEl.value || 'Itemized Deduction 4', amt: Math.max(0, parseFloat(ded4AmtEl.value) || 0) },
    { desc: ded5DescEl.value || 'Itemized Deduction 5', amt: Math.max(0, parseFloat(ded5AmtEl.value) || 0) }
  ];

  const totalDeductions = deductions.reduce((sum, item) => sum + item.amt, 0);
  const refundAmount = Math.max(0, deposit - totalDeductions);
  const balanceOwedByTenant = Math.max(0, totalDeductions - deposit);

  document.getElementById('refundDisplay').textContent = formatMoney(refundAmount, symbol);
  document.getElementById('totalDeductionsDisplay').textContent = formatMoney(totalDeductions, symbol);
  document.getElementById('balanceOwedDisplay').textContent = formatMoney(balanceOwedByTenant, symbol);

  return {
    symbol,
    tenant: tenantNameEl.value || 'Tenant',
    landlord: landlordNameEl.value || 'Landlord',
    address: propertyAddressEl.value || 'Rental Property',
    moveOut: moveOutDateEl.value || new Date().toLocaleDateString(),
    deposit,
    deductions,
    totalDeductions,
    refundAmount,
    balanceOwedByTenant
  };
}

function generatePDF() {
  const data = calculateDeposit();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor('#059669');
  doc.text('ITEMIZED SECURITY DEPOSIT STATEMENT', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Move-Out Date: ' + data.moveOut + '', 14, 29);

  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.text('Tenant: ' + data.tenant, 14, 40);
  doc.text('Landlord: ' + data.landlord, 110, 40);
  doc.text('Property: ' + data.address, 14, 47);

  const rows = [
    ['Original Security Deposit Held', formatMoney(data.deposit, data.symbol)]
  ];

  data.deductions.forEach((item) => {
    if (item.amt > 0) {
      rows.push(['Less: ' + item.desc, '-' + formatMoney(item.amt, data.symbol)]);
    }
  });

  rows.push(['Total Itemized Deductions', formatMoney(data.totalDeductions, data.symbol)]);
  rows.push(['NET REFUND DUE TO TENANT', formatMoney(data.refundAmount, data.symbol)]);

  if (data.balanceOwedByTenant > 0) {
    rows.push(['BALANCE OWED BY TENANT', formatMoney(data.balanceOwedByTenant, data.symbol)]);
  }

  autoTable(doc, {
    startY: 56,
    head: [['Itemized Description', 'Amount']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  const finalY = doc.lastAutoTable.finalY + 22;
  doc.line(14, finalY, 95, finalY);
  doc.setFontSize(9);
  doc.text('Landlord Signature & Date', 14, finalY + 5);

  doc.save('security-deposit-statement.pdf');
}

[
  currencyEl, tenantNameEl, landlordNameEl, propertyAddressEl,
  moveOutDateEl, initialDepositEl,
  ded1DescEl, ded1AmtEl,
  ded2DescEl, ded2AmtEl,
  ded3DescEl, ded3AmtEl,
  ded4DescEl, ded4AmtEl,
  ded5DescEl, ded5AmtEl
].forEach((el) => {
  el.addEventListener('input', calculateDeposit);
});

downloadBtn.addEventListener('click', generatePDF);
calculateDeposit();
