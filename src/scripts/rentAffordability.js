import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const annualIncomeEl = document.getElementById('annualIncome');
const monthlyDebtEl = document.getElementById('monthlyDebt');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAffordability() {
  const symbol = currencyEl.value;
  const annual = Math.max(0, parseFloat(annualIncomeEl.value) || 0);
  const debt = Math.max(0, parseFloat(monthlyDebtEl.value) || 0);

  const grossMonthly = annual / 12;
  const conservativeRent = grossMonthly * 0.25;
  const recommendedRent = grossMonthly * 0.30;
  const maxStretchRent = Math.max(0, grossMonthly * 0.36 - debt);
  const requiredAnnual40x = recommendedRent * 40;

  document.getElementById('recommendedRentDisplay').textContent = formatMoney(recommendedRent, symbol) + ' / mo';
  document.getElementById('conservativeDisplay').textContent = formatMoney(conservativeRent, symbol);
  document.getElementById('maxStretchDisplay').textContent = formatMoney(maxStretchRent, symbol);
  document.getElementById('grossMonthlyDisplay').textContent = formatMoney(grossMonthly, symbol);
  document.getElementById('landlord40xDisplay').textContent = formatMoney(requiredAnnual40x, symbol);

  return {
    symbol, annual, grossMonthly, debt,
    conservativeRent, recommendedRent, maxStretchRent, requiredAnnual40x
  };
}

function generatePDF() {
  const data = calculateAffordability();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#059669');
  doc.text('Monthly Rent Affordability Budget', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 29);

  autoTable(doc, {
    startY: 38,
    head: [['Rent Budget Tier', 'Monthly Amount']],
    body: [
      ['Annual Gross Income', formatMoney(data.annual, data.symbol)],
      ['Monthly Gross Income', formatMoney(data.grossMonthly, data.symbol)],
      ['Monthly Debt Payments', formatMoney(data.debt, data.symbol)],
      ['Conservative Rent Budget (25% Rule)', formatMoney(data.conservativeRent, data.symbol)],
      ['Recommended Rent Budget (30% Rule)', formatMoney(data.recommendedRent, data.symbol)],
      ['Maximum Stretch Budget (36% DTI Limit)', formatMoney(data.maxStretchRent, data.symbol)]
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  doc.save('rent-affordability-budget.pdf');
}

[currencyEl, annualIncomeEl, monthlyDebtEl].forEach((el) => {
  el.addEventListener('input', calculateAffordability);
});
downloadBtn.addEventListener('click', generatePDF);
calculateAffordability();
