import { jsPDF } from 'jspdf';

const currencyEl = document.getElementById('currency');
const landlordNameEl = document.getElementById('landlordName');
const tenantNameEl = document.getElementById('tenantName');
const propertyAddressEl = document.getElementById('propertyAddress');
const leaseTypeEl = document.getElementById('leaseType');
const startDateEl = document.getElementById('startDate');
const endDateEl = document.getElementById('endDate');
const monthlyRentEl = document.getElementById('monthlyRent');
const securityDepositEl = document.getElementById('securityDeposit');
const dueDayEl = document.getElementById('dueDay');
const petsAllowedEl = document.getElementById('petsAllowed');
const downloadBtn = document.getElementById('downloadPdfBtn');

function formatMoney(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateLeasePreview() {
  const symbol = currencyEl.value;
  const rent = Math.max(0, parseFloat(monthlyRentEl.value) || 0);
  const deposit = Math.max(0, parseFloat(securityDepositEl.value) || 0);

  document.getElementById('previewRent').textContent = formatMoney(rent, symbol) + ' / mo';
  document.getElementById('previewDeposit').textContent = formatMoney(deposit, symbol);
  document.getElementById('previewTerm').textContent = leaseTypeEl.value;
  document.getElementById('previewPets').textContent = petsAllowedEl.value;

  return {
    symbol,
    landlord: landlordNameEl.value || '[Landlord Full Name]',
    tenant: tenantNameEl.value || '[Tenant Full Name]',
    address: propertyAddressEl.value || '[Rental Property Address]',
    leaseType: leaseTypeEl.value,
    startDate: startDateEl.value || 'Start Date',
    endDate: endDateEl.value || 'End Date',
    rent,
    deposit,
    dueDay: dueDayEl.value || '1st',
    pets: petsAllowedEl.value
  };
}

function generatePDF() {
  const data = updateLeasePreview();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor('#059669');
  doc.text('RESIDENTIAL LEASE AGREEMENT', 14, 22);

  doc.setFontSize(9);
  doc.setTextColor('#64748b');
  doc.text('', 14, 28);

  doc.setFontSize(10);
  doc.setTextColor('#0f172a');

  const clauses = [
    `1. PARTIES: This Residential Lease Agreement ("Agreement") is entered into between ${data.landlord} ("Landlord") and ${data.tenant} ("Tenant").`,
    `2. PREMISES: Landlord agrees to rent to Tenant the residential property located at: ${data.address} ("Premises").`,
    `3. LEASE TERM: This is a ${data.leaseType} tenancy commencing on ${data.startDate} and ending on ${data.endDate} (unless renewed or terminated per state law).`,
    `4. MONTHLY RENT: Tenant agrees to pay Landlord monthly rent of ${formatMoney(data.rent, data.symbol)}, due on the ${data.dueDay} day of each calendar month.`,
    `5. SECURITY DEPOSIT: Upon signing, Tenant shall deposit ${formatMoney(data.deposit, data.symbol)} with Landlord as security for the performance of Tenant's obligations.`,
    `6. PET POLICY: ${data.pets}. Tenant shall be responsible for any damage caused by approved animals.`,
    `7. MAINTENANCE & USE: Tenant shall use the Premises solely as a private residence, keep it clean and sanitary, and promptly notify Landlord of required repairs.`,
    `8. GOVERNING LAW: This Agreement shall be governed by the residential landlord-tenant laws of the jurisdiction in which the Premises are located.`
  ];

  let y = 40;
  clauses.forEach((clause) => {
    const lines = doc.splitTextToSize(clause, 180);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 4;
  });

  // Signature Blocks
  y += 12;
  doc.setDrawColor('#94a3b8');
  doc.line(14, y, 90, y);
  doc.text('Landlord Signature & Date', 14, y + 5);

  doc.line(115, y, 195, y);
  doc.text('Tenant Signature & Date', 115, y + 5);

  doc.save('residential-lease-agreement.pdf');
}

[
  currencyEl, landlordNameEl, tenantNameEl, propertyAddressEl,
  leaseTypeEl, startDateEl, endDateEl, monthlyRentEl,
  securityDepositEl, dueDayEl, petsAllowedEl
].forEach((el) => {
  el.addEventListener('input', updateLeasePreview);
});

downloadBtn.addEventListener('click', generatePDF);
updateLeasePreview();
