const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src/lib/i18n/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const faqData = {
  "home.faq.title": "Frequently Asked Questions",
  "home.faq.items": [
    {
      "q": "Are these tools completely free to use?",
      "a": "Yes, all our utility tools are 100% free to use with no hidden fees or subscriptions."
    },
    {
      "q": "Are my files secure and private?",
      "a": "Absolutely. Your files are processed securely. We do not store your files on our servers longer than necessary, and many operations happen directly in your browser."
    },
    {
      "q": "Do I need to create an account?",
      "a": "No account or registration is required. You can start using our tools immediately."
    },
    {
      "q": "What file formats do you support?",
      "a": "We support a wide range of popular media formats including MP4, WebM, MOV, PDF, and more depending on the specific tool."
    },
    {
      "q": "Is there a file size limit?",
      "a": "While we aim to support large files, some tools may have practical limits based on your browser's memory or our processing capabilities to ensure fast performance."
    },
    {
      "q": "Can I use these tools on my mobile device?",
      "a": "Yes! Our website is fully responsive and designed to work seamlessly on smartphones, tablets, and desktop computers."
    }
  ]
};

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Create a new object to maintain order if possible, or just assign
  const newData = {};
  for (const [key, value] of Object.entries(data)) {
    newData[key] = value;
    if (key === 'home.hero.description') {
      newData['home.faq.title'] = faqData['home.faq.title'];
      newData['home.faq.items'] = faqData['home.faq.items'];
    }
  }
  
  // if not found, just append
  if (!newData['home.faq.title']) {
      newData['home.faq.title'] = faqData['home.faq.title'];
      newData['home.faq.items'] = faqData['home.faq.items'];
  }

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
});
