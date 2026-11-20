import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const inspectionTypeEl = document.getElementById('inspectionType');
const inspectionDateEl = document.getElementById('inspectionDate');
const propertyAddressEl = document.getElementById('propertyAddress');
const landlordNameEl = document.getElementById('landlordName');
const tenantNameEl = document.getElementById('tenantName');
const kitchenStatusEl = document.getElementById('kitchenStatus');
const livingStatusEl = document.getElementById('livingStatus');
const bedroomStatusEl = document.getElementById('bedroomStatus');
const bathroomStatusEl = document.getElementById('bathroomStatus');
const notesEl = document.getElementById('notes');
const downloadBtn = document.getElementById('downloadPdfBtn');

function generatePDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor('#059669');
  doc.text((inspectionTypeEl.value || 'MOVE-IN / MOVE-OUT').toUpperCase() + ' INSPECTION CHECKLIST', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('Inspection Date: ' + (inspectionDateEl.value || new Date().toLocaleDateString()), 14, 29);

  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.text('Property: ' + (propertyAddressEl.value || '______________________________'), 14, 40);
  doc.text('Landlord: ' + (landlordNameEl.value || '________________'), 14, 47);
  doc.text('Tenant: ' + (tenantNameEl.value || '________________'), 110, 47);

  autoTable(doc, {
    startY: 55,
    head: [['Room / Area', 'Items Inspected', 'Condition', 'Notes / Sign-Off']],
    body: [
      ['Kitchen', 'Appliances, Sink, Cabinets, Countertops, Flooring', kitchenStatusEl.value, ''],
      ['Living & Dining Room', 'Walls, Paint, Windows, Blinds, Doors, Carpet/Floor', livingStatusEl.value, ''],
      ['Bedrooms', 'Closets, Doors, Locks, Windows, Smoke Detectors', bedroomStatusEl.value, ''],
      ['Bathrooms', 'Toilet, Shower/Tub, Faucets, Exhaust Fan, Mirrors', bathroomStatusEl.value, ''],
      ['Exterior & Keys', 'Front/Back Entry, Mailbox Keys, Garage Remotes', 'Verified', '']
    ],
    theme: 'grid',
    headStyles: { fillColor: '#059669' }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Additional Remarks / Existing Wear:', 14, finalY);
  doc.setFont(undefined, 'normal');
  const noteLines = doc.splitTextToSize(notesEl.value || 'No major damages noted at time of inspection.', 180);
  doc.text(noteLines, 14, finalY + 6);

  const sigY = finalY + 34;
  doc.line(14, sigY, 95, sigY);
  doc.setFontSize(9);
  doc.text('Landlord Signature & Date', 14, sigY + 5);

  doc.line(115, sigY, 195, sigY);
  doc.text('Tenant Signature & Date', 115, sigY + 5);

  doc.save('property-inspection-checklist.pdf');
}

downloadBtn.addEventListener('click', generatePDF);
