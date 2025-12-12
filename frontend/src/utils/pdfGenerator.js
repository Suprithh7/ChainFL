import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a stunning PDF medical report for a patient
 * @param {Object} patient - Patient data with predictions
 * @param {Object} editedData - Optional edited patient info
 */
export const generatePatientPDF = (patient, editedData = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Use edited data if provided, otherwise use original
  const patientInfo = { ...patient, ...editedData };

  // Header with gradient effect (simulated with colors)
  doc.setFillColor(102, 126, 234); // Purple gradient start
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Hospital/System Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ChainFL-Care', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Multi-Disease Risk Assessment Report', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(patient.timestamp).toLocaleString()}`, pageWidth / 2, 33, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  let yPos = 50;

  // Patient Information Box
  doc.setFillColor(240, 240, 255);
  doc.roundedRect(10, yPos, pageWidth - 20, 35, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 15, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patientInfo.name}`, 15, yPos + 16);
  doc.text(`Age: ${patientInfo.age} years`, 15, yPos + 23);
  doc.text(`Gender: ${patientInfo.gender || 'N/A'}`, 15, yPos + 30);
  doc.text(`Contact: ${patientInfo.contact || 'N/A'}`, 100, yPos + 16);
  doc.text(`Patient ID: ${patientInfo.id}`, 100, yPos + 23);

  yPos += 45;

  // Risk Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('🎯 Risk Assessment Summary', 15, yPos);
  doc.setTextColor(0, 0, 0);

  yPos += 10;

  // Cardiac Risk (Main)
  const cardiacColor = patient.risk_category === 'Critical' || patient.risk_category === 'High' ? [220, 53, 69] :
    patient.risk_category === 'Moderate' ? [255, 193, 7] : [40, 167, 69];

  doc.setFillColor(...cardiacColor);
  doc.roundedRect(15, yPos, 80, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('❤️ CARDIAC RISK', 20, yPos + 8);
  doc.setFontSize(18);
  doc.text(`${patient.risk_score}%`, 20, yPos + 16);
  doc.setFontSize(10);
  doc.text(patient.risk_category, 55, yPos + 16);

  doc.setTextColor(0, 0, 0);
  yPos += 28;

  // Multi-Disease Risks Grid
  if (patient.multi_disease_risks) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Disease Risks', 15, yPos);
    yPos += 8;

    const diseases = Object.entries(patient.multi_disease_risks);
    const diseaseIcons = {
      diabetes: '🩺',
      kidney: '🫘',
      liver: '🫀',
      hypertension: '💊'
    };

    diseases.forEach(([disease, data], index) => {
      const xPos = 15 + (index % 2) * 95;
      const yOffset = Math.floor(index / 2) * 25;

      const color = data.risk_category === 'Critical' || data.risk_category === 'High' ? [220, 53, 69] :
        data.risk_category === 'Moderate' ? [255, 193, 7] : [40, 167, 69];

      doc.setFillColor(...color);
      doc.roundedRect(xPos, yPos + yOffset, 85, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${diseaseIcons[disease]} ${disease.toUpperCase()}`, xPos + 3, yPos + yOffset + 7);
      doc.setFontSize(14);
      doc.text(`${data.risk_score}%`, xPos + 3, yPos + yOffset + 15);
      doc.setFontSize(8);
      doc.text(data.risk_category, xPos + 30, yPos + yOffset + 15);
    });

    yPos += Math.ceil(diseases.length / 2) * 25 + 10;
  }

  // SHAP Analysis Section
  if (patient.top_factors && patient.top_factors.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 AI Explainability: Top Risk Factors', 15, yPos);
    yPos += 8;

    // Table of factors
    const factorData = patient.top_factors.map(f => [
      f.name,
      `+${f.points}`,
      f.severity
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Risk Factor', 'Points', 'Severity']],
      body: factorData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Clinical Recommendations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Clinical Recommendations', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recommendation = doc.splitTextToSize(patient.recommendation, pageWidth - 30);
  doc.text(recommendation, 15, yPos);
  yPos += recommendation.length * 5 + 10;

  // Vital Signs Table
  if (yPos + 60 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Clinical Parameters', 15, yPos);
  yPos += 8;

  const vitalData = [
    ['Blood Pressure', `${patient.bp} mmHg`],
    ['Cholesterol', `${patient.cholesterol} mg/dL`],
    ['Glucose', patient.glucose === 1 ? 'Elevated' : 'Normal'],
    ['Max Heart Rate', `${patient.maxHr} bpm`],
    ['ST Depression', patient.stDepression],
    ['Troponin', `${patient.troponin} ng/mL`],
    ['Ejection Fraction', `${patient.ejectionFraction}%`],
    ['Creatinine', `${patient.creatinine} mg/dL`],
    ['BMI', patient.bmi]
  ];

  doc.autoTable({
    startY: yPos,
    body: vitalData,
    theme: 'striped',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 90 }
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | ChainFL-Care Medical Report | Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`${patientInfo.name.replace(/\s+/g, '_')}_Medical_Report.pdf`);
};
