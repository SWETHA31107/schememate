const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'frontend', 'src', 'locales');

const keys = {
  nav: {
    home: { en: "Home", ta: "முகப்பு", hi: "होम", te: "హోమ్", kn: "ಮುಖಪುಟ", ml: "ഹോം", bn: "হোম", mr: "मुख्यपृष्ठ" },
    schemes: { en: "Schemes", ta: "திட்டங்கள்", hi: "योजनाएं", te: "పథకాలు", kn: "ಯೋಜನೆಗಳು", ml: "പദ്ധതികൾ", bn: "স্কিম", mr: "योजना" },
    compare: { en: "Compare", ta: "ஒப்பிடு", hi: "तुलना करें", te: "సరిపోల్చండి", kn: "ಹೋಲಿಸಿ", ml: "താരതമ്യം ചെയ്യുക", bn: "তুলনা করুন", mr: "तुलना करा" },
    checker: { en: "Eligibility Checker", ta: "தகுதிச் சரிபார்ப்பு", hi: "पात्रता जांचकर्ता", te: "అర్హత చెకర్", kn: "ಅರ್ಹತಾ ಪರಿಶೀಲಕ", ml: "അർഹതാ പരിശോധന", bn: "যোগ্যতা যাচাইকারী", mr: "पात्रता तपासनीस" },
    dashboard: { en: "Dashboard", ta: "டாஷ்போர்டு", hi: "डैशबोर्ड", te: "డాష్‌బోర్డ్", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", ml: "ഡാഷ്‌ബോർഡ്", bn: "ড্যাশবোর্ড", mr: "डॅशबोर्ड" },
    rate_us: { en: "Rate Us", ta: "மதிப்பிடுக", hi: "हमें रेट करें", te: "మాకు రేట్ చేయండి", kn: "ನಮ್ಮನ್ನು ರೇಟ್ ಮಾಡಿ", ml: "ഞങ്ങളെ വിലയിരുത്തുക", bn: "আমাদের রেট দিন", mr: "आम्हाला रेट करा" }
  },
  home: {
    hero_title: { en: "Find Your Perfect Financial Scheme Today", ta: "உங்கள் சரியான நிதித் திட்டத்தை இன்றே கண்டறியவும்", hi: "आज ही अपनी सही वित्तीय योजना खोजें", te: "ఈరోజే మీ పర్ఫెక్ట్ ఫైనాన్షియల్ స్కీమ్‌ను కనుగొనండి", kn: "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಆರ್ಥಿಕ ಯೋಜನೆಯನ್ನು ಇಂದು ಕಂಡುಕೊಳ್ಳಿ", ml: "നിങ്ങളുടെ തികഞ്ഞ സാമ്പത്തിക പദ്ധതി ഇന്ന് കണ്ടെത്തുക", bn: "আজই আপনার নিখুঁত আর্থিক স্কিম খুঁজুন", mr: "तुमची परिपूर्ण आर्थिक योजना आजच शोधा" },
    hero_subtitle: { en: "A unified platform to discover, compare, and check eligibility for government and banking schemes tailored specifically to you.", ta: "உங்களுக்கு ஏற்ற அரசு மற்றும் வங்கித் திட்டங்களைக் கண்டறிய, ஒப்பிட மற்றும் தகுதியைச் சரிபார்க்க ஒரு ஒருங்கிணைந்த தளம்.", hi: "विशेष रूप से आपके लिए तैयार की गई सरकारी और बैंकिंग योजनाओं को खोजने, तुलना करने और पात्रता की जांच करने के लिए एक एकीकृत मंच।", te: "ప్రభుత్వ మరియు ఋణ పథకాలను పోల్చి చూసే వేదిక.", kn: "ನಿಮಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸುವ ವೇದಿಕೆ.", ml: "പദ്ധതികൾ കണ്ടെത്താനും താരതമ്യം ചെയ്യാനുമുള്ള വേദി.", bn: "সরকারি এবং ব্যাঙ্কিং স্কিমগুলির তুলনা করার প্ল্যাটফর্ম।", mr: "तुमच्यासाठी सरकारी आणि बँकिंग योजनांची तुलना करण्यासाठी प्लॅटफॉर्म." },
    cta: { en: "Browse All Schemes", ta: "அனைத்து திட்டங்களையும் காண்க", hi: "सभी योजनाएं ब्राउज़ करें", te: "అన్ని పథకాలను బ్రౌజ్ చేయండి", kn: "ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", ml: "എല്ലാ പദ്ധതികളും ബ്രൗസ് ചെയ്യുക", bn: "সমস্ত স্কিম ব্রাউজ করুন", mr: "सर्व योजना ब्राउझ करा" }
  },
  eligibility: {
    title: { en: "Eligibility Checker", ta: "தகுதிச் சரிபார்ப்பு", hi: "पात्रता जांचकर्ता", te: "అర్హత చెకర్", kn: "ಅರ್ಹತಾ ಪರಿಶೀಲಕ", ml: "അർഹതാ പരിശോധന", bn: "যোগ্যতা যাচাইকারী", mr: "पात्रता तपासनीस" },
    subtitle: { en: "Instantly verify if you qualify for a specific scheme without applying.", ta: "விண்ணப்பிக்காமல் தகுதியை சரிபார்க்கவும்.", hi: "आवेदन किए बिना तुरंत सत्यापित करें कि क्या आप पात्र हैं।", te: "దరఖాస్తు చేయడానికి ముందు అర్హతను తనిఖీ చేయండి.", kn: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.", ml: "അപേക്ഷിക്കുന്നതിന് മുമ്പ് അർഹത പരിശോധിക്കുക.", bn: "আবেদন করার আগে যোগ্যতা যাচাই করুন।", mr: "अर्ज करण्यापूर्वी पात्रता तपासा." },
    salaried: { en: "Salaried Employee", ta: "சம்பளம் பெறும் ஊழியர்", hi: "वेतनभोगी कर्मचारी", te: "జీతం పొందే ఉద్యోగి", kn: "ಸಂಬಳ ಪಡೆಯುವ ನೌಕರ", ml: "ശമ്പളമുള്ള ജീവനക്കാരൻ", bn: "বেতনভুক্ত কর্মচারী", mr: "पगारी कर्मचारी" },
    self_employed: { en: "Self-Employed / Business", ta: "சுய தொழில் / வணிகம்", hi: "स्वरोजगार / व्यापार", te: "స్వయం ఉపాధి / వ్యాపారం", kn: "ಸ್ವಯಂ ಉದ್ಯೋಗ / ವ್ಯಾಪಾರ", ml: "സ്വയം തൊഴിൽ / ബിസിനസ്സ്", bn: "স্ব-কর্মসংস্থান / ব্যবসা", mr: "स्वयंरोजगार / व्यवसाय" },
    student: { en: "Student", ta: "மாணவர்", hi: "छात्र", te: "విద్యార్థి", kn: "ವಿದ್ಯಾರ್ಥಿ", ml: "വിദ്യാർത്ഥി", bn: "ছাত্র", mr: "विद्यार्थी" },
    farmer: { en: "Farmer / Agriculture", ta: "விவசாயி", hi: "किसान / कृषि", te: "రైతు / వ్యవసాయం", kn: "ರೈತ / ಕೃಷಿ", ml: "കർഷകൻ / കൃഷി", bn: "কৃষক / কৃষি", mr: "शेतकरी / शेती" },
    unemployed: { en: "Unemployed / Other", ta: "வேலையற்றோர் / மற்றவர்கள்", hi: "बेरोजगार / अन्य", te: "నిరుద్యోగి / ఇతర", kn: "ನಿರುದ್ಯೋಗಿ / ಇತರೆ", ml: "തൊഴിലില്ലാത്ത / മറ്റുള്ളവ", bn: "বেকার / অন্যান্য", mr: "बेरोजगार / इतर" }
  }
};

const languages = ['en', 'ta', 'hi', 'te', 'ml'];

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  let currentData = {};
  if (fs.existsSync(filePath)) {
    currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // ensure objects exist
  ['nav', 'home', 'eligibility'].forEach(cat => {
    if (!currentData[cat]) currentData[cat] = {};
  });

  // populate translation
  Object.keys(keys).forEach(category => {
    Object.keys(keys[category]).forEach(key => {
       currentData[category][key] = keys[category][key][lang] || keys[category][key]['en'];
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
  console.log(`Updated ${lang}.json`);
});
