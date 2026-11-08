const fs = require('fs');
let code = fs.readFileSync('Devops-project/server/index.js', 'utf8');

code = code.replace(
  "const sharedEmail = (process.env.DOCTOR_SHARED_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();",
  "const sharedEmail = (process.env.DOCTOR_SHARED_EMAIL || '').toLowerCase().trim();"
);

code = code.replace(
  "const recEmail = (process.env.RECEPTIONIST_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();",
  "const recEmail = (process.env.RECEPTIONIST_EMAIL || '').toLowerCase().trim();"
);

code = code.replace(
  "const recPass = process.env.RECEPTIONIST_PASSWORD || 'webreciption56';",
  "const recPass = process.env.RECEPTIONIST_PASSWORD || '';"
);

code = code.replace(
  "const authorizedRecEmail = (process.env.RECEPTIONIST_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();",
  "const authorizedRecEmail = (process.env.RECEPTIONIST_EMAIL || '').toLowerCase().trim();"
);

code = code.replace(
  "const authorizedRecPassword = process.env.RECEPTIONIST_PASSWORD || 'webreciption56';",
  "const authorizedRecPassword = process.env.RECEPTIONIST_PASSWORD || '';"
);

code = code.replace(
  "const sharedDoctorEmail = (process.env.DOCTOR_SHARED_EMAIL || 'anusikan0426@gmail.com').toLowerCase().trim();",
  "const sharedDoctorEmail = (process.env.DOCTOR_SHARED_EMAIL || '').toLowerCase().trim();"
);

fs.writeFileSync('Devops-project/server/index.js', code, 'utf8');
console.log('REPLACED CREDENTIAL FALLBACKS IN INDEX.JS');
