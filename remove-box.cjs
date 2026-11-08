const fs = require('fs');
let content = fs.readFileSync('Devops-project/client/src/pages/Register.jsx', 'utf8');

const regex = /<div style=\{\{ background: "#ecfdf5"[\s\S]*?<\/div>\r?\n\s*/;

if (regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync('Devops-project/client/src/pages/Register.jsx', content, 'utf8');
  console.log('REMOVED GREEN CREDENTIAL BOX SUCCESSFULLY');
} else {
  console.log('PATTERN NOT MATCHED');
}
