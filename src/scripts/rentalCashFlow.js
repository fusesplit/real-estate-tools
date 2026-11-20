import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const purchasePriceEl = document.getElementById('purchasePrice');
const downPaymentEl = document.getElementById('downPayment');
const closingCostsEl = document.getElementById('closingCosts');
const interestRateEl = document.getElementById('interestRate');
const monthlyRentEl = document.getElementById('monthlyRent');
const monthlyExpensesEl = document.getElementById('monthlyExpenses');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateCashFlow() {
  const symbol = currencyEl.value;
  const price = Math.max(0, parseFloat(purchasePriceEl.value) || 0);
  const down = Math.max(0, parseFloat(downPaymentEl.value) || 0);
  const closing = Math.max(0, parseFloat(closingCostsEl.value) || 0);
  const rate = Math.max(0, parseFloat(interestRateEl.value) || 0);
  const rent = Math.max(0, parseFloat(monthlyRentEl.value) || 0);
  const expenses = Math.max(0, parseFloat(monthlyExpensesEl.value) || 0);

  const loanAmount = Math.max(0, price - down);
  const totalCashInvested = down + closing;
  const monthlyRate = rate / 100 / 12;
  const months = 360;

  let monthlyMortgage = 0;
  if (monthlyRate > 0 && loanAmount > 0) {
    monthlyMortgage = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
                      (Math.pow(1 + monthlyRate, months) - 1);
  } else if (loanAmount > 0) {
    monthlyMortgage = loanAmount / months;
  }

  const monthlyCashFlow = rent - monthlyMortgage - expenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const cocReturn = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;

  const cfEl = document.getElementById('monthlyCashFlowDisplay');
  cfEl.textContent = formatMoney(monthlyCashFlow, symbol) + ' / mo';
  cfEl.className = monthlyCashFlow >= 0
    ? 'text-4xl md:text-5xl font-extrabold text-emerald-600 mt-1 mb-6'
    : 'text-4xl md:text-5xl font-extrabold text-rose-600 mt-1 mb-6';

  document.getElementById('annualCashFlowDisplay').textContent = formatMoney(annualCashFlow, symbol);
  document.getElementById('cocReturnDisplay').textContent = cocReturn.toFixed(2) + '%';
  document.getElementById('mortgageDisplay').textContent = formatMoney(monthlyMortgage, symbol);
  document.getElementById('cashInvestedDisplay').textContent = formatMoney(totalCashInvested, symbol);

  return {
    symbol, price, down, closing, loanAmount, totalCashInvested,
    rate, rent, expenses, monthlyMortgage, monthlyCashFlow, annualCashFlow, cocReturn
  };
}

function generatePDF() {
  const data = calculateCashFlow();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#059669');
  doc.text('Rental Property Cash Flow & ROI Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 29);

  autoTable(doc, {
    startY: 38,
    head: [['Investment Metric', 'Value']],
    body: [
      ['Purchase Price', formatMoney(data.price, data.symbol)],
      ['Down Payment + Closing Costs (Total Cash In)', formatMoney(data.totalCashInvested, data.symbol)],
      ['Mortgage Loan Amount (30-Yr @ ' + data.rate + '%)', formatMoney(data.loanAmount, data.symbol)],
      ['Gross Monthly Rental Income', formatMoney(data.rent, data.symbol)],
      ['Monthly Mortgage (Principal & Interest)', '-' + formatMoney(data.monthlyMortgage, data.symbol)],
      ['Monthly Operating Expenses (Tax, Ins, Maint)', '-' + formatMoney(data.expenses, data.symbol)],
      ['Net Monthly Cash Flow', formatMoney(data.monthlyCashFlow, data.symbol)],
      ['Net Annual Cash Flow', formatMoney(data.annualCashFlow, data.symbol)],
      ['Cash-on-Cash Return (ROI)', data.cocReturn.toFixed(2) + '%']
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  doc.save('rental-property-cash-flow.pdf');
}

[currencyEl, purchasePriceEl, downPaymentEl, closingCostsEl, interestRateEl, monthlyRentEl, monthlyExpensesEl].forEach((el) => {
  el.addEventListener('input', calculateCashFlow);
});
downloadBtn.addEventListener('click', generatePDF);
calculateCashFlow();
