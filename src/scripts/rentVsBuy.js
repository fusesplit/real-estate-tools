import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyEl = document.getElementById('currency');
const monthlyRentEl = document.getElementById('monthlyRent');
const rentIncreaseEl = document.getElementById('rentIncrease');
const homePriceEl = document.getElementById('homePrice');
const downPaymentEl = document.getElementById('downPayment');
const mortgageRateEl = document.getElementById('mortgageRate');
const yearsStayEl = document.getElementById('yearsStay');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateRentVsBuy() {
  const symbol = currencyEl.value;
  const startRent = Math.max(0, parseFloat(monthlyRentEl.value) || 0);
  const rentGrowth = Math.max(0, parseFloat(rentIncreaseEl.value) || 0) / 100;
  const homePrice = Math.max(0, parseFloat(homePriceEl.value) || 0);
  const downPayment = Math.max(0, parseFloat(downPaymentEl.value) || 0);
  const rate = Math.max(0, parseFloat(mortgageRateEl.value) || 0);
  const years = Math.max(1, parseInt(yearsStayEl.value) || 5);

  // Total Rent Paid over N years
  let totalRentCost = 0;
  let currentRent = startRent;
  for (let y = 1; y <= years; y++) {
    totalRentCost += currentRent * 12;
    currentRent *= (1 + rentGrowth);
  }

  // Buy Net Cost (Payments + Tax/Maint - Equity Gained assuming 3% appreciation)
  const loan = Math.max(0, homePrice - downPayment);
  const mRate = rate / 100 / 12;
  const n = 360;
  let monthlyPI = 0;
  if (mRate > 0 && loan > 0) {
    monthlyPI = (loan * (mRate * Math.pow(1 + mRate, n))) / (Math.pow(1 + mRate, n) - 1);
  } else if (loan > 0) {
    monthlyPI = loan / n;
  }

  let balance = loan;
  let totalInterestPaid = 0;
  for (let m = 1; m <= years * 12; m++) {
    const intPay = balance * mRate;
    const prinPay = Math.min(balance, monthlyPI - intPay);
    totalInterestPaid += intPay;
    balance = Math.max(0, balance - prinPay);
  }

  const futureHomeValue = homePrice * Math.pow(1.03, years);
  const appreciationGain = futureHomeValue - homePrice;
  const annualTaxMaint = homePrice * 0.022 * years;
  const sellingClosingCosts = futureHomeValue * 0.06;
  const netBuyCost = Math.max(0, totalInterestPaid + annualTaxMaint + sellingClosingCosts - appreciationGain);

  const diff = Math.abs(totalRentCost - netBuyCost);
  const verdictEl = document.getElementById('verdictDisplay');

  if (netBuyCost < totalRentCost) {
    verdictEl.textContent = 'Buying saves ' + formatMoney(diff, symbol);
  } else {
    verdictEl.textContent = 'Renting saves ' + formatMoney(diff, symbol);
  }

  document.getElementById('totalRentDisplay').textContent = formatMoney(totalRentCost, symbol);
  document.getElementById('netBuyDisplay').textContent = formatMoney(netBuyCost, symbol);
  document.getElementById('futureValueDisplay').textContent = formatMoney(futureHomeValue, symbol);

  return {
    symbol, years, startRent, homePrice, downPayment, rate,
    totalRentCost, netBuyCost, futureHomeValue, verdict: verdictEl.textContent
  };
}

function generatePDF() {
  const data = calculateRentVsBuy();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#059669');
  doc.text('Rent vs. Buy Financial Comparison (' + data.years + ' Years)', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 29);

  doc.setFontSize(11);
  doc.setTextColor('#059669');
  doc.text('Result: ' + data.verdict + ' over ' + data.years + ' years', 14, 39);

  autoTable(doc, {
    startY: 46,
    head: [['Comparison Metric', 'Figure']],
    body: [
      ['Time Horizon', data.years + ' Years'],
      ['Starting Monthly Rent', formatMoney(data.startRent, data.symbol)],
      ['Total Out-of-Pocket Rent Paid', formatMoney(data.totalRentCost, data.symbol)],
      ['Home Purchase Price', formatMoney(data.homePrice, data.symbol)],
      ['Est. Home Value After ' + data.years + ' Yrs (3%/yr)', formatMoney(data.futureHomeValue, data.symbol)],
      ['Net Unrecoverable Cost of Buying', formatMoney(data.netBuyCost, data.symbol)]
    ],
    theme: 'striped',
    headStyles: { fillColor: '#059669' }
  });

  doc.save('rent-vs-buy-comparison.pdf');
}

[currencyEl, monthlyRentEl, rentIncreaseEl, homePriceEl, downPaymentEl, mortgageRateEl, yearsStayEl].forEach((el) => {
  el.addEventListener('input', calculateRentVsBuy);
});
downloadBtn.addEventListener('click', generatePDF);
calculateRentVsBuy();
