import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const propertyAddressEl = document.getElementById('propertyAddress');
const applicantNameEl = document.getElementById('applicantName');
const applicantPhoneEl = document.getElementById('applicantPhone');
const applicantEmailEl = document.getElementById('applicantEmail');
const currentAddressEl = document.getElementById('currentAddress');
const currentLandlordEl = document.getElementById('currentLandlord');
const employerNameEl = document.getElementById('employerName');
const jobTitleEl = document.getElementById('jobTitle');
const monthlyIncomeEl = document.getElementById('monthlyIncome');
const moveInDateEl = document.getElementById('moveInDate');
const occupantsEl = document.getElementById('occupants');
const downloadBtn = document.getElementById('downloadPdfBtn');

function generatePDF() {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#059669');
  doc.text('RESIDENTIAL RENTAL APPLICATION', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Property Applied For: ' + (propertyAddressEl.value || '_____________________________'), 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [['Applicant Personal Information', 'Details']],
    body: [
      ['Full Legal Name', applicantNameEl.value || ''],
      ['Phone Number', applicantPhoneEl.value || ''],
      ['Email Address', applicantEmailEl.value || ''],
      ['Desired Move-In Date', moveInDateEl.value || ''],
      ['Total Number of Occupants', occupantsEl.value || '1']
    ],
    theme: 'grid',
    headStyles: { fillColor: '#059669' }
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Rental History & Employment', 'Details']],
    body: [
      ['Current Residential Address', currentAddressEl.value || ''],
      ['Current Landlord Name & Phone', currentLandlordEl.value || ''],
      ['Current Employer', employerNameEl.value || ''],
      ['Job Title / Position', jobTitleEl.value || ''],
      ['Gross Monthly Income', monthlyIncomeEl.value ? '$' + monthlyIncomeEl.value : '']
    ],
    theme: 'grid',
    headStyles: { fillColor: '#059669' }
  });

  const finalY = doc.lastAutoTable.finalY + 14;
  doc.setFontSize(9);
  doc.setTextColor('#334155');
  const authText = 'AUTHORIZATION: Applicant certifies that all information provided above is true and complete, and authorizes Landlord/Agent to verify employment, rental history, and credit/background records.';
  doc.text(doc.splitTextToSize(authText, 180), 14, finalY);

  doc.line(14, finalY + 24, 105, finalY + 24);
  doc.text('Applicant Signature', 14, finalY + 29);

  doc.line(125, finalY + 24, 195, finalY + 24);
  doc.text('Date', 125, finalY + 29);

  doc.save('tenant-rental-application.pdf');
}

downloadBtn.addEventListener('click', generatePDF);
