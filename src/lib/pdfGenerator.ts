import { FarmVisit } from './supabase';

export async function generatePDF(visit: FarmVisit) {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Farm Visit Report - ${visit.farmer_name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #10b981;
      border-bottom: 2px solid #10b981;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 12px;
      padding: 8px;
      background: #f9fafb;
      border-radius: 5px;
    }
    .field-label {
      font-weight: 600;
      color: #374151;
      display: inline-block;
      min-width: 180px;
    }
    .field-value {
      color: #1f2937;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-routine {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-emergency {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-followup {
      background: #fef3c7;
      color: #92400e;
    }
    .photo {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-top: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .issues-list {
      list-style: none;
      padding: 0;
    }
    .issues-list li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    .issues-list li:before {
      content: "•";
      color: #10b981;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .notes-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin-top: 10px;
      border-radius: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Farm Visit Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">1. Farmer Details</div>
    <div class="field">
      <span class="field-label">Farmer Name:</span>
      <span class="field-value">${visit.farmer_name}</span>
    </div>
    <div class="field">
      <span class="field-label">Farm ID:</span>
      <span class="field-value">${visit.farm_id}</span>
    </div>
    <div class="field">
      <span class="field-label">Phone Number:</span>
      <span class="field-value">${visit.phone_number}</span>
    </div>
    <div class="field">
      <span class="field-label">Village/Location:</span>
      <span class="field-value">${visit.village_location}</span>
    </div>
    <div class="field">
      <span class="field-label">GPS Coordinates:</span>
      <span class="field-value">${visit.gps_coordinates || 'Not provided'}</span>
    </div>
    <div class="field">
      <span class="field-label">Farm Size:</span>
      <span class="field-value">${visit.farm_size_acres} acres</span>
    </div>
    <div class="field">
      <span class="field-label">Farm Type:</span>
      <span class="field-value">${visit.farm_type}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Visit Details</div>
    <div class="field">
      <span class="field-label">Date of Visit:</span>
      <span class="field-value">${new Date(visit.visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    <div class="field">
      <span class="field-label">Visit Type:</span>
      <span class="badge badge-${visit.visit_type.toLowerCase().replace('-', '')}">${visit.visit_type}</span>
    </div>
    <div class="field">
      <span class="field-label">Officer Name:</span>
      <span class="field-value">${visit.officer_name}</span>
    </div>
    <div class="field">
      <span class="field-label">Time Spent:</span>
      <span class="field-value">${visit.time_spent_hours} hours</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Observations</div>

    ${(visit.farm_type === 'Crop' || visit.farm_type === 'Mixed') && visit.main_crops ? `
    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h3 style="color: #047857; margin-top: 0;">Crop Information</h3>
      <div class="field">
        <span class="field-label">Main Crops:</span>
        <span class="field-value">${visit.main_crops}</span>
      </div>
      ${visit.crop_stage ? `
      <div class="field">
        <span class="field-label">Crop Stage:</span>
        <span class="field-value">${visit.crop_stage}</span>
      </div>
      ` : ''}
      ${visit.crop_issues && visit.crop_issues.length > 0 ? `
      <div class="field">
        <span class="field-label">Crop Issues:</span>
        <ul class="issues-list">
          ${visit.crop_issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${(visit.farm_type === 'Livestock' || visit.farm_type === 'Mixed') && visit.livestock_type ? `
    <div style="background: #ecfeff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h3 style="color: #0e7490; margin-top: 0;">Livestock Information</h3>
      <div class="field">
        <span class="field-label">Livestock Type:</span>
        <span class="field-value">${visit.livestock_type}</span>
      </div>
      <div class="field">
        <span class="field-label">Number of Animals:</span>
        <span class="field-value">${visit.number_of_animals || 0}</span>
      </div>
      ${visit.livestock_issues && visit.livestock_issues.length > 0 ? `
      <div class="field">
        <span class="field-label">Livestock Issues:</span>
        <ul class="issues-list">
          ${visit.livestock_issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${visit.photo_url ? `
    <div class="field">
      <span class="field-label">Farm Photo:</span>
      <br>
      <img src="${visit.photo_url}" alt="Farm visit photo" class="photo" crossorigin="anonymous">
    </div>
    ` : ''}

    ${visit.video_link ? `
    <div class="field">
      <span class="field-label">Video Link:</span>
      <span class="field-value"><a href="${visit.video_link}" target="_blank">${visit.video_link}</a></span>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">4. Recommendations</div>
    <div class="notes-box">
      ${visit.advice_given.replace(/\n/g, '<br>')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">5. Follow-up</div>
    <div class="field">
      <span class="field-label">Follow-up Needed:</span>
      <span class="field-value" style="font-weight: 600; color: ${visit.follow_up_needed ? '#ea580c' : '#059669'};">
        ${visit.follow_up_needed ? 'YES' : 'NO'}
      </span>
    </div>
    ${visit.follow_up_needed && visit.proposed_follow_up_date ? `
    <div class="field">
      <span class="field-label">Proposed Follow-up Date:</span>
      <span class="field-value">${new Date(visit.proposed_follow_up_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    ` : ''}
    <div class="field">
      <span class="field-label">Training Needed:</span>
      <span class="field-value">${visit.training_needed ? 'Yes' : 'No'}</span>
    </div>
    ${visit.referral_to_specialist ? `
    <div class="field">
      <span class="field-label">Referral to Specialist:</span>
      <span class="field-value">${visit.referral_to_specialist}</span>
    </div>
    ` : ''}
    ${visit.additional_notes ? `
    <div class="field">
      <span class="field-label">Additional Notes:</span>
      <div class="notes-box">
        ${visit.additional_notes.replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}
  </div>

  <div class="footer">
    <p>Farm Visit Management System</p>
    <p>Report ID: ${visit.id}</p>
    <p>Created: ${visit.created_at ? new Date(visit.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    alert('Please allow popups to download the PDF');
  }
}
