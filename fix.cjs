const fs = require('fs');
const files = [
  'src/modules/tracking/LiveTracking.jsx',
  'src/modules/schooladmin/pages/LiveTracking.jsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(f, content);
  console.log(f + ' fixed');
});
