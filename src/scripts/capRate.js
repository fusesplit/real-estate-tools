import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const propertyPriceEl = document.getElementById('propertyPrice');
const monthlyRentEl = document.getElementById('monthlyRent');
const vacancyRateEl = document.getElementById('vacancyRate');
const propertyTaxEl = document.getElementById('propertyTax');
const insuranceEl = document.getElementById('insurance');
const maintenanceEl = document.getElementById('maintenance');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateCapRate() {
  const symbol = currencyEl.value;
  const price = Math.max(1, parseFloat(propertyPriceEl.value) || 0);
  const grossMonthlyRent = Math.max(0, parseFloat(monthlyRentEl.value) || 0);
  const vacancyPct = Math.max(0, parseFloat(vacancyRateEl.value) || 0);
  const annualTax = Math.max(0, parseFloat(propertyTaxEl.value) || 0);
  const annualIns = Math.max(0, parseFloat(insuranceEl.value) || 0);
  const annualMaint = Math.max(0, parseFloat(maintenanceEl.value) || 0);

  const grossAnnualRent = grossMonthlyRent * 12;
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyPct / 100);
  const totalOperatingExpenses = annualTax + annualIns + annualMaint;
  const noi = effectiveGrossIncome - totalOperatingExpenses;
  const capRate = (noi / price) * 100;

  document.getElementById('capRateDisplay').textContent = capRate.toFixed(2) + '%';
  document.getElementById('noiDisplay').textContent = formatMoney(noi, symbol);
  document.getElementById('grossIncomeDisplay').textContent = formatMoney(effectiveGrossIncome, symbol);
  document.getElementById('expensesDisplay').textContent = formatMoney(totalOperatingExpenses, symbol);

  return {
    symbol, price, grossAnnualRent, effectiveGrossIncome,
    totalOperatingExpenses, noi, capRate
  };
}

function generatePDF() {
  const data = calculateCapRate();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#059669');
  doc.text('Rental Property Cap Rate & NOI Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Date: ' + new Date().toLocaleDateString(), 14, 29);

  autoTable(doc, {
    startY: 40,
    head: [['Real Estate Valuation Metric', 'Annual Figure']],
    body: [
      ['Property Purchase Price / Value', formatMoney(data.price, data.symbol)],
      ['Gross Scheduled Annual Rent', formatMoney(data.grossAnnualRent, data.symbol)],
      ['Effective Gross Income (After Vacancy)', formatMoney(data.effectiveGrossIncome, data.symbol)],
      ['Total Annual Operating Expenses', formatMoney(data.totalOperatingExpenses, data.symbol)],
      ['Net Operating Income (NOI)', formatMoney(data.noi, data.symbol)],
      ['Capitalization Rate (Cap Rate)', data.capRate.toFixed(2) + '%']
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  doc.save('rental-property-cap-rate-report.pdf');
}

[
  currencyEl, propertyPriceEl, monthlyRentEl, vacancyRateEl,
  propertyTaxEl, insuranceEl, maintenanceEl
].forEach((el) => {
  el.addEventListener('input', calculateCapRate);
});

downloadBtn.addEventListener('click', generatePDF);
calculateCapRate();
