// The Rāmāyaṇa today: the places of the epic as they are now, the festivals that keep it alive, its tellings across
// the world and the words it has left in our languages. Identifications follow living tradition; where several places
// hold the same tradition, that is said.

export const PLACES_TODAY = [
  { id: 'ayodhya', then: 'Ayodhyā', dev: 'अयोध्या', img: 'ill/ayodhya-0-0-5.webp',
    now: 'Ayodhya, Uttar Pradesh, India',
    text: 'The city of Rāma\'s birth still stands on the Sarayū. The Śrī Rāma Janmabhūmi Mandir was consecrated here on 22 January 2024, and on the eve of Dīpāvalī the river ghats glow with lakhs of clay lamps in the Deepotsav. Hanumān Gaṛhī, a fortress-temple on a hill, is where by tradition Hanumān keeps watch over the city.' },
  { id: 'mithila', then: 'Mithilā', dev: 'मिथिला', img: 'ill/bala-14-0-1.webp',
    now: 'Janakpur, Nepal · Sītāmaṛhī, Bihar, India',
    text: 'Sītā\'s home is honoured on both sides of today\'s border. In Janakpur, Nepal, the white-domed Jānakī Mandir (1910) marks King Janaka\'s city; Sītāmaṛhī in Bihar is revered as the field where Janaka found her in the furrow of his plough. Every winter, Vivāha Pañcamī re-enacts her wedding to Rāma.' },
  { id: 'chitrakoot', then: 'Citrakūṭa', dev: 'चित्रकूट', img: 'ill/ayodhya-11-1-0.webp',
    now: 'Chitrakoot, on the Madhya Pradesh – Uttar Pradesh border, India',
    text: 'Pilgrims walk barefoot round Kāmadgiri, the hill where the exiles made their first home, and bathe at Rāmghāṭ on the Mandākinī, where Bharata came to ask Rāma to return.' },
  { id: 'panchavati', then: 'Pañcavaṭī', dev: 'पञ्चवटी', img: 'ill/aranya-2-1-1.webp',
    now: 'Panchavati, Nashik, Maharashtra, India',
    text: 'On the Godāvarī at Nashik, the Kāḷārām temple and the Sītā Guphā, a narrow cave among five old banyans, recall the forest home from which Sītā was taken. Nashik is also one of the four cities of the Kumbh Melā.' },
  { id: 'jatayu-fall', then: 'Where Jaṭāyu fell', dev: 'जटायु', img: 'ill/aranya-12-0-1.webp',
    now: 'Lepakshi, Andhra Pradesh · Chadayamangalam, Kerala, India',
    text: 'Lepakshi takes its name, by tradition, from Rāma\'s words to the fallen bird: "Le, pakṣi" — "Rise, O bird". In Kerala, the rock where Jaṭāyu is said to have fallen now carries a great stone sculpture of him at Jatayu Earth\'s Center.' },
  { id: 'kishkindha', then: 'Kiṣkindhā', dev: 'किष्किन्धा', img: 'ill/kishkindha-0-0-0.webp',
    now: 'Hampi and Anegundi, Karnataka, India',
    text: 'Among the boulder hills on the Tuṅgabhadrā, Añjanādri hill is climbed by pilgrims as the birthplace of Hanumān, with Ṛṣyamūka and the lotus lake of Pampā close by. (Anjaneri near Nashik and the hills of Tirumala hold the same tradition.)' },
  { id: 'rameswaram', then: 'Rāmeśvaram & the Setu', dev: 'रामेश्वरम्', img: 'ill/yuddha-5-0-0.webp',
    now: 'Rameswaram, Tamil Nadu, India — and the shoals to Mannar, Sri Lanka',
    text: 'The Rāmanāthasvāmī temple, one of the twelve Jyotirliṅgas, enshrines the liṅga Rāma worshipped before the war, and its pillared corridors are among the longest in India. From Dhanuṣkoḍi a chain of limestone shoals runs about 48 km to Mannar in Sri Lanka: Rāma Setu, also called Adam\'s Bridge.' },
  { id: 'lanka', then: 'Laṅkā', dev: 'लङ्का', img: 'ill/aranya-13-1-1.webp',
    now: 'Sri Lanka',
    text: 'In the hills near Nuwara Eliya, the Sītā Amman temple at Sita Eliya is revered as the Aśoka Vāṭikā where Sītā waited, and Rāvaṇa Falls near Ella carries the king\'s name. Pilgrims follow a "Ramayana Trail" of such places across the island.' },
  { id: 'sanjeevani', then: 'The mountain of herbs', dev: 'संजीवनी', img: 'ill/yuddha-12-1-2.webp',
    now: 'Dronagiri, Uttarakhand, India · Rumassala, Sri Lanka',
    text: 'No relic of Hanumān or his gadā has ever been found; what remains is a living geography of devotion. In Dronagiri village, folk tradition says the people still do not worship Hanumān, for he carried off their mountain; near Galle, the green hill of Rumassala is said to be a piece of it that fell as he flew, and its slopes are rich in medicinal plants.' },
];

export const FESTIVALS = [
  { name: 'Rāma Navamī', dev: 'राम नवमी', when: 'Caitra · March–April', img: 'ill/bala-4-0-3.webp',
    text: 'Rāma\'s birth at noon on the ninth day of spring. Ayodhyā fills with pilgrims, and homes and temples read the Rāmcaritmānas.' },
  { name: 'Hanumān Jayantī', dev: 'हनुमान जयन्ती', when: 'Caitra Pūrṇimā · March–April', img: 'ill/sundara-0-1-0.webp',
    text: 'Hanumān\'s birth: the Hanumān Cālīsā is sung through the day (in the south the festival falls in other months).' },
  { name: 'Vijayādaśamī', dev: 'विजयादशमी', when: 'Āśvina · September–October', img: 'ill/yuddha-15-1-1.webp',
    text: 'Dussehra, the victory of dharma. Rāmlīlā is played in towns and villages for nine nights, and on the tenth great effigies of Rāvaṇa, Kumbhakarṇa and Meghanāda are burned.' },
  { name: 'Dīpāvalī', dev: 'दीपावली', when: 'Kārttika · October–November', img: 'ill/ayodhya-0-1-2.webp',
    text: 'The lamps lit for Rāma, Sītā and Lakṣmaṇa coming home to Ayodhyā — now a festival of light kept across the world.' },
  { name: 'Vivāha Pañcamī', dev: 'विवाह पञ्चमी', when: 'Mārgaśīrṣa · November–December', img: 'ill/bala-15-2-3.webp',
    text: 'The wedding of Sītā and Rāma, celebrated with processions in Janakpur and Ayodhyā.' },
];

export const WORLD = [
  { land: 'Thailand', name: 'Ramakien', text: 'The national epic, painted along the galleries of Wat Phra Kaew in Bangkok. The old capital Ayutthaya took its name from Ayodhyā.' },
  { land: 'Cambodia', name: 'Reamker', text: 'The battle of Laṅkā is carved in stone along a gallery of Angkor Wat, and the Reamker is still danced by the royal ballet.' },
  { land: 'Indonesia', name: 'Kakawin Rāmāyaṇa', text: 'Told in Old Javanese a thousand years ago; the Rāmāyaṇa ballet is performed beneath the temples of Prambanan, and Bali\'s kecak chants the battle.' },
  { land: 'Laos · Myanmar · Malaysia', name: 'Phra Lak Phra Lam · Yama Zatdaw · Hikayat Seri Rama', text: 'Each land tells Rāma\'s story in its own language, dance and theatre.' },
  { land: 'Nepal', name: 'Bhānubhakta Rāmāyaṇa', text: 'Bhānubhakta Ācārya\'s Nepali Rāmāyaṇa, and Janakpur, the city of Sītā.' },
  { land: 'The Caribbean, Mauritius & Fiji', name: 'Rāmāyaṇa singing', text: 'In Trinidad, Guyana, Suriname, Mauritius and Fiji, families descended from Indian workers of the 19th century still gather to sing the Rāmcaritmānas and play Rāmlīlā.' },
  { land: 'Across India', name: 'A hundred Rāmāyaṇas', text: 'Kamban\'s Tamil Rāmāyaṇam, Tulsīdās\'s Awadhi Rāmcaritmānas, Kṛttivās in Bengali, Ezhuthachan in Malayalam, Raṅganātha in Telugu, Eknāth in Marathi — and Rāmnagar\'s month-long Rāmlīlā at Vārāṇasī, part of a tradition UNESCO lists as heritage of humanity.' },
  { land: 'On screen', name: 'Ramanand Sagar\'s Rāmāyaṇ', text: 'The television serial of 1987–88 emptied streets on Sunday mornings; shown again in 2020, it drew one of the largest audiences in television history.' },
];

export const WORDS = [
  { w: 'Lakṣmaṇa-rekhā', dev: 'लक्ष्मण रेखा', m: 'a line that must not be crossed' },
  { w: 'Agni-parīkṣā', dev: 'अग्नि परीक्षा', m: 'a trial by fire: the hardest test of truth' },
  { w: 'Rāma-bāṇa', dev: 'रामबाण', m: 'a sure cure: Rāma\'s arrow never misses' },
  { w: 'Sañjīvanī', dev: 'संजीवनी', m: 'a remedy that brings back life' },
  { w: 'Kumbhakarṇa\'s sleep', dev: 'कुम्भकर्णी नींद', m: 'a sleep nothing can wake' },
  { w: 'Rāma-rājya', dev: 'रामराज्य', m: 'a just and kindly rule, where no one suffers' },
];
