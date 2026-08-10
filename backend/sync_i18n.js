const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'frontend', 'src', 'locales');
const enFile = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const otherLocales = [
  'hi.json', 'ta.json', 'te.json', 'ml.json'
];

otherLocales.forEach(file => {
  const filePath = path.join(localesDir, file);
  let data = {};
  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      data = {};
    }
  }

  // Deep merge enData into data, but keep existing translations if any
  const merge = (target, source) => {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        if (!target[key]) target[key] = source[key];
      }
    });
  };

  merge(data, enData);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log('Successfully uniformized all 5 language files.');
