// Reader languages for the Living Book. Story text comes from js/data/i18n/<id>.js
// (built by tools/build-i18n.mjs); the interface strings below are written by hand.
export const LANGS = [
  { id: 'en', name: 'English', bcp: 'en-IN' },
  { id: 'hi', name: 'हिन्दी', bcp: 'hi-IN', font: 'Tiro+Devanagari+Hindi:ital@0;1' },
  { id: 'hi-Latn', name: 'Hindi (Roman)', bcp: 'hi-IN', audio: 'hi' },
  { id: 'te', name: 'తెలుగు', bcp: 'te-IN', font: 'Tiro+Telugu:ital@0;1' },
  { id: 'ta', name: 'தமிழ்', bcp: 'ta-IN', font: 'Tiro+Tamil:ital@0;1' },
  { id: 'kn', name: 'ಕನ್ನಡ', bcp: 'kn-IN', font: 'Tiro+Kannada:ital@0;1' },
  { id: 'ml', name: 'മലയാളം', bcp: 'ml-IN', font: 'Noto+Serif+Malayalam:wght@400;600;700' },
  { id: 'mr', name: 'मराठी', bcp: 'mr-IN', font: 'Tiro+Devanagari+Marathi:ital@0;1' }
];
export const LANG = Object.fromEntries(LANGS.map(l => [l.id, l]));

const KANDA = {
  en: null,
  hi: ['प्रस्तावना', 'बालकाण्ड', 'अयोध्याकाण्ड', 'अरण्यकाण्ड', 'किष्किन्धाकाण्ड', 'सुन्दरकाण्ड', 'युद्धकाण्ड', 'उत्तरकाण्ड'],
  'hi-Latn': ['Prastavana', 'Baal Kaand', 'Ayodhya Kaand', 'Aranya Kaand', 'Kishkindha Kaand', 'Sundar Kaand', 'Yuddh Kaand', 'Uttar Kaand'],
  te: ['ఉపోద్ఘాతం', 'బాలకాండ', 'అయోధ్యాకాండ', 'అరణ్యకాండ', 'కిష్కింధాకాండ', 'సుందరకాండ', 'యుద్ధకాండ', 'ఉత్తరకాండ'],
  ta: ['முன்னுரை', 'பால காண்டம்', 'அயோத்தியா காண்டம்', 'ஆரண்ய காண்டம்', 'கிஷ்கிந்தா காண்டம்', 'சுந்தர காண்டம்', 'யுத்த காண்டம்', 'உத்தர காண்டம்'],
  kn: ['ಪೀಠಿಕೆ', 'ಬಾಲಕಾಂಡ', 'ಅಯೋಧ್ಯಾಕಾಂಡ', 'ಅರಣ್ಯಕಾಂಡ', 'ಕಿಷ್ಕಿಂಧಾಕಾಂಡ', 'ಸುಂದರಕಾಂಡ', 'ಯುದ್ಧಕಾಂಡ', 'ಉತ್ತರಕಾಂಡ'],
  ml: ['ആമുഖം', 'ബാലകാണ്ഡം', 'അയോദ്ധ്യാകാണ്ഡം', 'ആരണ്യകാണ്ഡം', 'കിഷ്കിന്ധാകാണ്ഡം', 'സുന്ദരകാണ്ഡം', 'യുദ്ധകാണ്ഡം', 'ഉത്തരകാണ്ഡം'],
  mr: ['प्रस्तावना', 'बालकांड', 'अयोध्याकांड', 'अरण्यकांड', 'किष्किंधाकांड', 'सुंदरकांड', 'युद्धकांड', 'उत्तरकांड']
};
const BOOK_IDS = ['prologue', 'bala', 'ayodhya', 'aranya', 'kishkindha', 'sundara', 'yuddha', 'uttara'];

// Śrī Rāma Rāma Rāmeti in the reader's own script, or its meaning where the script is already Devanagari.
const SHLOKA = {
  en: 'Śrī Rāma Rāma Rāmeti, Rame Rāme Manorame |<br>Sahasranāma Tattulyaṁ, Rāma Nāma Varānane ||',
  'hi-Latn': 'Shri Ram Ram Rameti, Rame Rame Manorame |<br>Sahasranaam Tattulyam, Ram Naam Varanane ||',
  hi: '(भगवान शिव पार्वती से कहते हैं) हे सुमुखी! मैं इस मनोरम राम-नाम में ही रमता हूँ; यह एक राम-नाम विष्णु के सहस्र नामों के तुल्य है।',
  mr: '(भगवान शंकर पार्वतीला सांगतात) हे सुमुखी! मी या मनोहर राम-नामातच रमतो; हे एक राम-नाम विष्णूच्या सहस्र नामांइतके आहे.',
  te: 'శ్రీ రామ రామ రామేతి రమే రామే మనోరమే ।<br>సహస్రనామ తత్తుల్యం రామనామ వరాననే ॥',
  ta: 'ஸ்ரீ ராம ராம ராமேதி ரமே ராமே மனோரமே ।<br>ஸஹஸ்ரநாம தத்துல்யம் ராமநாம வரானனே ॥',
  kn: 'ಶ್ರೀ ರಾಮ ರಾಮ ರಾಮೇತಿ ರಮೇ ರಾಮೇ ಮನೋರಮೇ ।<br>ಸಹಸ್ರನಾಮ ತತ್ತುಲ್ಯಂ ರಾಮನಾಮ ವರಾನನೇ ॥',
  ml: 'ശ്രീ രാമ രാമ രാമേതി രമേ രാമേ മനോരമേ ।<br>സഹസ്രനാമ തത്തുല്യം രാമനാമ വരാനനേ ॥'
};

const UI = {
  en: {
    read: 'Read Along', pause: 'Pause', loading: 'Opening the book…', lang: 'Read in', sarga: 'Sarga', sargas: 'Sargas', original: 'read the original ↗',
    telling: 'In Vālmīki’s telling', every: 'Every Sarga of the {k}', count: '{n} sargas. Tap a line to read its retelling; ↗ opens the original verses.',
    suci: 'Sarga Sūcī', contents: 'Anukramaṇikā · Contents', open: 'Open the book to begin', subs: 'Subtitles', cover: 'The Rāmāyaṇa<br><small>of Mahārṣi Vālmīki</small>',
    hint: 'Turn the pages by their corners, use the arrows below, or press <b>Read Along</b>. Click any paragraph to see it come alive on the stage.',
    end1: 'Thus ends the Śrīmad Rāmāyaṇa of Vālmīki, the First Poem.', end2: 'As long as the mountains stand and the rivers flow, so long shall the story of the Rāmāyaṇa be told among the worlds.',
    note: ''
  },
  hi: {
    read: 'कथा सुनें', pause: 'रोकें', loading: 'पुस्तक खुल रही है…', lang: 'भाषा', sarga: 'सर्ग', sargas: 'सर्ग', original: 'मूल श्लोक पढ़ें ↗',
    telling: 'वाल्मीकि के अनुसार', every: '{k} के सभी सर्ग', count: '{n} सर्ग। किसी पंक्ति को छूकर उसकी कथा पढ़ें; ↗ से मूल श्लोक खुलते हैं।',
    suci: 'सर्ग सूची', contents: 'अनुक्रमणिका', open: 'आरंभ करने के लिए पुस्तक खोलें', subs: 'उपशीर्षक', cover: 'रामायण<br><small>महर्षि वाल्मीकि कृत</small>',
    hint: 'पन्नों को कोने से पलटें, नीचे के तीरों का प्रयोग करें, या <b>कथा सुनें</b> दबाएँ। किसी भी अनुच्छेद को छूकर उसे मंच पर जीवंत होते देखें।',
    end1: 'इस प्रकार आदिकाव्य, महर्षि वाल्मीकि कृत श्रीमद् रामायण सम्पूर्ण हुआ।', end2: 'जब तक पृथ्वी पर पर्वत रहेंगे और नदियाँ बहेंगी, तब तक लोकों में रामायण की कथा कही जाती रहेगी।',
    note: 'इस पुस्तक का हिन्दी पाठ अंग्रेज़ी पुनर्कथन से IndicTrans2 (AI4Bharat) की सहायता से अनूदित है। नाम और घटनाएँ वाल्मीकि रामायण के अनुसार हैं।'
  },
  'hi-Latn': {
    read: 'Katha Suniye', pause: 'Rokiye', loading: 'Pustak khul rahi hai…', lang: 'Bhasha', sarga: 'Sarg', sargas: 'Sarg', original: 'mool shlok padhiye ↗',
    telling: 'Valmiki ke anusaar', every: '{k} ke sabhi sarg', count: '{n} sarg. Kisi pankti ko chhookar uski katha padhiye; ↗ se mool shlok khulte hain.',
    suci: 'Sarg Suchi', contents: 'Anukramanika', open: 'Aarambh karne ke liye pustak kholiye', subs: 'Subtitles', cover: 'Ramayan<br><small>Maharshi Valmiki krit</small>',
    hint: 'Panno ko kone se paltiye, neeche ke teeron ka prayog kijiye, ya <b>Katha Suniye</b> dabaiye. Kisi bhi anuchchhed ko chhookar use manch par jeevant hote dekhiye.',
    end1: 'Is prakaar aadikavya, Maharshi Valmiki krit Shrimad Ramayan sampoorn hua.', end2: 'Jab tak prithvi par parvat rahenge aur nadiyan bahengi, tab tak lokon mein Ramayan ki katha kahi jaati rahegi.',
    note: 'Is pustak ka Hindi paath angrezi punarkathan se IndicTrans2 (AI4Bharat) ki sahayata se anudit hai, aur Roman lipi mein likha gaya hai.'
  },
  te: {
    read: 'కథ వినండి', pause: 'ఆపండి', loading: 'పుస్తకం తెరుచుకుంటోంది…', lang: 'భాష', sarga: 'సర్గ', sargas: 'సర్గలు', original: 'మూల శ్లోకాలు చదవండి ↗',
    telling: 'వాల్మీకి కథనం ప్రకారం', every: '{k}లోని అన్ని సర్గలు', count: '{n} సర్గలు. ఏ పంక్తినైనా తాకి దాని కథ చదవండి; ↗ మూల శ్లోకాలను తెరుస్తుంది.',
    suci: 'సర్గ సూచిక', contents: 'విషయసూచిక', open: 'ప్రారంభించడానికి పుస్తకం తెరవండి', subs: 'ఉపశీర్షికలు', cover: 'రామాయణం<br><small>మహర్షి వాల్మీకి విరచితం</small>',
    hint: 'పేజీలను మూలల నుండి తిప్పండి, కింది బాణాలను వాడండి, లేదా <b>కథ వినండి</b> నొక్కండి. ఏ పేరానైనా తాకితే అది రంగస్థలంపై సజీవంగా కనిపిస్తుంది.',
    end1: 'ఈ విధంగా ఆదికావ్యమైన మహర్షి వాల్మీకి విరచిత శ్రీమద్రామాయణం సంపూర్ణం.', end2: 'భూమిపై పర్వతాలు నిలిచి, నదులు ప్రవహించినంత కాలం లోకాలలో రామాయణ కథ ప్రచారంలో ఉంటుంది.',
    note: 'ఈ పుస్తకం తెలుగు పాఠం ఆంగ్ల పునఃకథనం నుండి IndicTrans2 (AI4Bharat) సహాయంతో అనువదించబడింది. పేర్లు, ఘట్టాలు వాల్మీకి రామాయణం ప్రకారం ఉన్నాయి.'
  },
  ta: {
    read: 'கதை கேளுங்கள்', pause: 'நிறுத்து', loading: 'புத்தகம் திறக்கிறது…', lang: 'மொழி', sarga: 'சர்க்கம்', sargas: 'சர்க்கங்கள்', original: 'மூல சுலோகங்களைப் படிக்க ↗',
    telling: 'வால்மீகியின் கூற்றுப்படி', every: '{k} — அனைத்து சர்க்கங்களும்', count: '{n} சர்க்கங்கள். ஒரு வரியைத் தொட்டு அதன் கதையைப் படியுங்கள்; ↗ மூல சுலோகங்களைத் திறக்கும்.',
    suci: 'சர்க்க அட்டவணை', contents: 'பொருளடக்கம்', open: 'தொடங்க புத்தகத்தைத் திறங்கள்', subs: 'வசனங்கள்', cover: 'இராமாயணம்<br><small>மகரிஷி வால்மீகி அருளியது</small>',
    hint: 'பக்கங்களை மூலையிலிருந்து புரட்டுங்கள், கீழே உள்ள அம்புகளைப் பயன்படுத்துங்கள், அல்லது <b>கதை கேளுங்கள்</b> என்பதை அழுத்துங்கள். எந்தப் பத்தியைத் தொட்டாலும் அது மேடையில் உயிர் பெறும்.',
    end1: 'இவ்வாறு ஆதிகாவியமான மகரிஷி வால்மீகியின் ஸ்ரீமத் இராமாயணம் நிறைவுற்றது.', end2: 'பூமியில் மலைகள் நிற்கும் வரையிலும் நதிகள் ஓடும் வரையிலும், உலகங்களில் இராமாயணக் கதை சொல்லப்பட்டுக் கொண்டே இருக்கும்.',
    note: 'இந்நூலின் தமிழ்ப் பாடம் ஆங்கில மறுகூறலிலிருந்து IndicTrans2 (AI4Bharat) உதவியுடன் மொழிபெயர்க்கப்பட்டது. பெயர்களும் நிகழ்வுகளும் வால்மீகி இராமாயணத்தைப் பின்பற்றுகின்றன.'
  },
  kn: {
    read: 'ಕಥೆ ಕೇಳಿ', pause: 'ನಿಲ್ಲಿಸಿ', loading: 'ಪುಸ್ತಕ ತೆರೆಯುತ್ತಿದೆ…', lang: 'ಭಾಷೆ', sarga: 'ಸರ್ಗ', sargas: 'ಸರ್ಗಗಳು', original: 'ಮೂಲ ಶ್ಲೋಕಗಳನ್ನು ಓದಿ ↗',
    telling: 'ವಾಲ್ಮೀಕಿಯ ಕಥನದಂತೆ', every: '{k}ದ ಎಲ್ಲ ಸರ್ಗಗಳು', count: '{n} ಸರ್ಗಗಳು. ಯಾವುದೇ ಸಾಲನ್ನು ಸ್ಪರ್ಶಿಸಿ ಅದರ ಕಥೆ ಓದಿ; ↗ ಮೂಲ ಶ್ಲೋಕಗಳನ್ನು ತೆರೆಯುತ್ತದೆ.',
    suci: 'ಸರ್ಗ ಸೂಚಿ', contents: 'ಪರಿವಿಡಿ', open: 'ಆರಂಭಿಸಲು ಪುಸ್ತಕವನ್ನು ತೆರೆಯಿರಿ', subs: 'ಉಪಶೀರ್ಷಿಕೆಗಳು', cover: 'ರಾಮಾಯಣ<br><small>ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ವಿರಚಿತ</small>',
    hint: 'ಪುಟಗಳನ್ನು ಮೂಲೆಯಿಂದ ತಿರುಗಿಸಿ, ಕೆಳಗಿನ ಬಾಣಗಳನ್ನು ಬಳಸಿ, ಅಥವಾ <b>ಕಥೆ ಕೇಳಿ</b> ಒತ್ತಿ. ಯಾವುದೇ ಪ್ಯಾರಾವನ್ನು ಸ್ಪರ್ಶಿಸಿದರೆ ಅದು ರಂಗದ ಮೇಲೆ ಜೀವಂತವಾಗುತ್ತದೆ.',
    end1: 'ಹೀಗೆ ಆದಿಕಾವ್ಯವಾದ ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ವಿರಚಿತ ಶ್ರೀಮದ್ರಾಮಾಯಣ ಸಂಪೂರ್ಣವಾಯಿತು.', end2: 'ಭೂಮಿಯ ಮೇಲೆ ಪರ್ವತಗಳು ನಿಂತಿರುವವರೆಗೆ, ನದಿಗಳು ಹರಿಯುವವರೆಗೆ, ಲೋಕಗಳಲ್ಲಿ ರಾಮಾಯಣದ ಕಥೆ ಪ್ರಚಲಿತವಾಗಿರುತ್ತದೆ.',
    note: 'ಈ ಪುಸ್ತಕದ ಕನ್ನಡ ಪಾಠವನ್ನು ಇಂಗ್ಲಿಷ್ ಪುನರ್ಕಥನದಿಂದ IndicTrans2 (AI4Bharat) ಸಹಾಯದಿಂದ ಅನುವಾದಿಸಲಾಗಿದೆ. ಹೆಸರುಗಳು ಮತ್ತು ಘಟನೆಗಳು ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣವನ್ನು ಅನುಸರಿಸುತ್ತವೆ.'
  },
  ml: {
    read: 'കഥ കേൾക്കൂ', pause: 'നിർത്തുക', loading: 'പുസ്തകം തുറക്കുന്നു…', lang: 'ഭാഷ', sarga: 'സർഗ്ഗം', sargas: 'സർഗ്ഗങ്ങൾ', original: 'മൂല ശ്ലോകങ്ങൾ വായിക്കുക ↗',
    telling: 'വാല്മീകിയുടെ ആഖ്യാനത്തിൽ', every: '{k} — എല്ലാ സർഗ്ഗങ്ങളും', count: '{n} സർഗ്ഗങ്ങൾ. ഒരു വരിയിൽ തൊട്ട് അതിന്റെ കഥ വായിക്കുക; ↗ മൂല ശ്ലോകങ്ങൾ തുറക്കുന്നു.',
    suci: 'സർഗ്ഗ സൂചിക', contents: 'ഉള്ളടക്കം', open: 'തുടങ്ങാൻ പുസ്തകം തുറക്കുക', subs: 'ഉപശീർഷകങ്ങൾ', cover: 'രാമായണം<br><small>മഹർഷി വാല്മീകി വിരചിതം</small>',
    hint: 'പേജുകൾ മൂലയിൽ നിന്ന് മറിക്കുക, താഴെയുള്ള അമ്പുകൾ ഉപയോഗിക്കുക, അല്ലെങ്കിൽ <b>കഥ കേൾക്കൂ</b> അമർത്തുക. ഏത് ഖണ്ഡികയിൽ തൊട്ടാലും അത് വേദിയിൽ ജീവൻ വയ്ക്കും.',
    end1: 'ഇങ്ങനെ ആദികാവ്യമായ മഹർഷി വാല്മീകി വിരചിതമായ ശ്രീമദ് രാമായണം സമ്പൂർണ്ണം.', end2: 'ഭൂമിയിൽ പർവ്വതങ്ങൾ നിലനിൽക്കുകയും നദികൾ ഒഴുകുകയും ചെയ്യുന്നിടത്തോളം കാലം ലോകങ്ങളിൽ രാമായണകഥ പ്രചരിക്കും.',
    note: 'ഈ പുസ്തകത്തിന്റെ മലയാള പാഠം ഇംഗ്ലീഷ് പുനരാഖ്യാനത്തിൽ നിന്ന് IndicTrans2 (AI4Bharat) ന്റെ സഹായത്തോടെ പരിഭാഷപ്പെടുത്തിയതാണ്. പേരുകളും സംഭവങ്ങളും വാല്മീകി രാമായണത്തെ പിന്തുടരുന്നു.'
  },
  mr: {
    read: 'कथा ऐका', pause: 'थांबवा', loading: 'पुस्तक उघडत आहे…', lang: 'भाषा', sarga: 'सर्ग', sargas: 'सर्ग', original: 'मूळ श्लोक वाचा ↗',
    telling: 'वाल्मीकींच्या कथनानुसार', every: '{k} — सर्व सर्ग', count: '{n} सर्ग. एखाद्या ओळीला स्पर्श करून तिची कथा वाचा; ↗ मूळ श्लोक उघडतो.',
    suci: 'सर्ग सूची', contents: 'अनुक्रमणिका', open: 'सुरुवात करण्यासाठी पुस्तक उघडा', subs: 'उपशीर्षके', cover: 'रामायण<br><small>महर्षी वाल्मीकी विरचित</small>',
    hint: 'पाने कोपऱ्यातून उलटा, खालील बाण वापरा किंवा <b>कथा ऐका</b> दाबा. कोणत्याही परिच्छेदाला स्पर्श करा आणि तो मंचावर जिवंत होताना पाहा.',
    end1: 'अशा प्रकारे आदिकाव्य, महर्षी वाल्मीकी विरचित श्रीमद् रामायण संपूर्ण झाले.', end2: 'जोपर्यंत पृथ्वीवर पर्वत उभे आहेत आणि नद्या वाहत आहेत, तोपर्यंत लोकांमध्ये रामायणाची कथा सांगितली जाईल.',
    note: 'या पुस्तकाचा मराठी पाठ इंग्रजी पुनर्कथनावरून IndicTrans2 (AI4Bharat) च्या साहाय्याने अनुवादित केला आहे. नावे आणि घटना वाल्मीकी रामायणानुसार आहेत.'
  }
};

const KEY = 'ramayana3d.lang';
let current = 'en', pack = null, speechPack = null;
const listeners = new Set();

export function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  let saved = null; try { saved = localStorage.getItem(KEY); } catch { }
  return LANG[q] ? q : LANG[saved] ? saved : 'en';
}
export const lang = () => current;
export const langInfo = () => LANG[current];

// Load the script's book font before the pages are measured, so pagination matches what is drawn.
const fontsLoaded = new Set();
async function loadFont(l) {
  if (!l.font || fontsLoaded.has(l.id)) return;
  fontsLoaded.add(l.id);
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = `https://fonts.googleapis.com/css2?family=${l.font}&display=swap`;
  document.head.appendChild(link);
  await new Promise(res => { link.onload = res; link.onerror = res; setTimeout(res, 4000); });
  const fam = decodeURIComponent(l.font.split(':')[0]).replace(/\+/g, ' ');
  await Promise.race([document.fonts.load(`20px "${fam}"`), new Promise(r => setTimeout(r, 3000))]).catch(() => { });
}

export async function setLang(id) {
  if (!LANG[id]) id = 'en';
  const l = LANG[id];
  let p = null;
  if (id !== 'en') {
    try { p = (await import(`./data/i18n/${id}.js`)).default; } catch (e) { console.warn('no translation for', id, e); p = null; }
  }
  // Hindi in Roman letters is heard in Hindi: keep the Devanagari text for the browser voice
  let sp = null;
  if (id === 'hi-Latn') { try { sp = (await import('./data/i18n/hi.js')).default; } catch { sp = null; } }
  await loadFont(l);
  current = id; pack = p; speechPack = sp;
  try { localStorage.setItem(KEY, id); } catch { }
  document.documentElement.dataset.read = id;
  listeners.forEach(f => f(id));
  return !!p || id === 'en';
}
export const onLang = f => { listeners.add(f); return () => listeners.delete(f); };
export const hasPack = () => current === 'en' || !!pack;

/* ── lookups (English is the fallback for anything not yet translated) ── */
export function ui(k, vars) {
  let s = (UI[current] || UI.en)[k] ?? UI.en[k] ?? k;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b);
  return s;
}
export const shloka = () => SHLOKA[current] || SHLOKA.en;
export const tr = (key, en) => (pack?.seg?.[key]) || en;
export const kandaName = (bookId, en) => { const i = BOOK_IDS.indexOf(bookId); return (KANDA[current] && i >= 0) ? KANDA[current][i] : en; };
export const trSpeech = (key, fallback) => (speechPack?.seg?.[key]) || fallback;
export const trSay = en => (pack?.say?.[en]) || en;
export const trName = (id, en) => (pack?.names?.[id]) || en;
export const isIndic = () => current !== 'en' && current !== 'hi-Latn';

// Sanskrit headings (नारद-वाल्मीकि संवाद) in the reader's own script, as Sanskrit is printed in Telugu, Kannada
// and Malayalam books. These scripts share Devanagari's Unicode layout, so each letter moves by a fixed offset.
// Tamil cannot spell Sanskrit without Grantha letters, so the Tamil edition keeps Devanagari.
const SCRIPT_BASE = { te: 0x0C00, kn: 0x0C80, ml: 0x0D00 };
export function inScript(s) {
  const base = SCRIPT_BASE[current];
  if (!base || !s) return s;
  let out = '';
  for (const ch of s) {
    let c = ch.codePointAt(0);
    if (c < 0x0901 || c > 0x096F || c === 0x0964 || c === 0x0965 || c === 0x0950) { out += ch; continue; }   // danda, ॐ: shared signs
    if (c === 0x093C) continue;                                     // nukta: not used in Sanskrit
    if (c === 0x0901 && current !== 'te') c = 0x0902;                // candrabindu → anusvāra where fonts lack it
    out += String.fromCodePoint(c - 0x0900 + base);
  }
  return out;
}
// Kāṇḍa numbers: the reader's numerals (౧ ೧ ൧), Western digits for Tamil, Devanagari for Hindi and Marathi
export function numeral(n) {
  const s = String(n);
  if (current === 'en' || current === 'hi' || current === 'mr' || current === 'hi-Latn') return s.replace(/\d/g, d => String.fromCodePoint(0x0966 + +d));
  if (current === 'ta') return s;
  return s.replace(/\d/g, d => String.fromCodePoint(SCRIPT_BASE[current] + 0x66 + +d));
}
