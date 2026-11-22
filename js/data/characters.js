// Character compendium of the Vālmīki Rāmāyaṇa.
// views: 4-angle turnaround sheets in assets/characters/<id>-<view>.jpg

export const FACTIONS = {
  divine:   { label: 'Devas & the Divine',   dev: 'देव',       color: '#9bb8ff' },
  raghu:    { label: 'House of Raghu',       dev: 'रघुकुल',    color: '#f4c96b' },
  mithila:  { label: 'House of Janaka',      dev: 'मिथिला',    color: '#ff9fb0' },
  rishi:    { label: 'Ṛṣis & Ascetics',      dev: 'ऋषि',       color: '#ffd9a0' },
  vanara:   { label: 'Vānaras & Allies',     dev: 'वानर',      color: '#ffb347' },
  rakshasa: { label: 'Rākṣasas of Laṅkā',    dev: 'राक्षस',    color: '#ff5a5a' }
};

const V = (id) => ['front', 'left', 'right', 'back'].map(v => `assets/characters/${id}-${v}.jpg`);

export const CHARACTERS = [
  // ───────── HOUSE OF RAGHU ─────────
  {
    id: 'rama', name: 'Śrī Rāma', dev: 'श्रीराम', faction: 'raghu', views: V('rama'),
    title: 'Maryādā Puruṣottama — the Ideal Man, Seventh Avatāra of Viṣṇu',
    lineage: 'Eldest son of King Daśaratha and Queen Kausalyā · Ikṣvāku / Raghu dynasty',
    weapon: 'Kodaṇḍa bow, divine astras of Viśvāmitra & Agastya',
    bio: [
      `Rāma is the hero of the Ādi Kāvya. Lord Viṣṇu took birth as a man so that Rāvaṇa, who had scorned humans when asking for his boon, could be destroyed. Valmiki describes him as dark like a rain cloud, with long arms, a broad chest and lotus eyes. He was truthful, compassionate, learned, and steady as the Himālaya.`,
      `His defining quality is unbroken adherence to dharma. He gave up a throne with a smile, kept his father’s word for fourteen years in the forest, granted refuge to anyone who sought it, and ruled so justly that “Rāma Rājya” became India’s name for the ideal state. Valmiki says of him: “रामो विग्रहवान् धर्मः”, Rāma is dharma embodied.`
    ],
    moments: ['Slays Tāṭakā and protects Viśvāmitra’s sacrifice', 'Breaks the bow of Śiva and weds Sītā', 'Accepts exile without a trace of anger', 'Grants refuge to Vibhīṣaṇa', 'Slays Rāvaṇa with the Brahmāstra', 'Crowned in Ayodhyā; enters the Sarayū to return to his divine form']
  },
  {
    id: 'sita', name: 'Sītā', dev: 'सीता', faction: 'mithila', views: V('sita'),
    title: 'Jānakī, Vaidehī, Maithilī — Daughter of the Earth, Incarnation of Lakṣmī',
    lineage: 'Found in a furrow by King Janaka of Mithilā · Wife of Śrī Rāma · Mother of Lava & Kuśa',
    weapon: 'Her truth and chastity, which even fire could not burn',
    bio: [
      `Sītā was not born of a womb. She rose from the earth when King Janaka ploughed the sacrificial ground, and he named her “furrow.” According to the Uttara Kāṇḍa, she was the rebirth of Vedavatī, who had vowed to destroy Rāvaṇa.`,
      `She chose the forest with Rāma over the palace without him. In Laṅkā, alone among demons for nearly a year, she never once wavered. She refused to speak to Rāvaṇa directly and placed a blade of grass between them. She even refused Hanumān’s offer of rescue, so that Rāma would win her back with honour. She walked through fire, and at the end she returned to her mother, the Earth.`
    ],
    moments: ['Rises from the earth at Mithilā', '“Wherever you are is Ayodhyā”: follows Rāma into exile', 'Abducted by Rāvaṇa; drops her ornaments as a trail', 'Gives Hanumān her cūḍāmaṇi in the Aśoka grove', 'Agni Parīkṣā: Agni himself returns her', 'Enters the Earth with Bhūdevī']
  },
  {
    id: 'lakshmana', name: 'Lakṣmaṇa', dev: 'लक्ष्मण', faction: 'raghu', views: V('lakshmana'),
    title: 'Saumitri — Rāma’s Shadow, Slayer of Indrajit',
    lineage: 'Son of Daśaratha and Sumitrā · Twin of Śatrughna · Husband of Ūrmilā',
    weapon: 'Bow & Aindrāstra',
    bio: [
      `From infancy Lakṣmaṇa would not eat or sleep apart from Rāma. Valmiki calls him Rāma’s “second life breathing outside his body.” He left his palace and his new bride Ūrmilā to serve Rāma and Sītā for fourteen years, building their huts and guarding them through the nights.`,
      `He was fiery where Rāma was calm, quick to anger at injustice and fierce in battle. He killed the mighty Atikāya and Indrajit, conqueror of Indra. His devotion was absolute. When Sugrīva showed him Sītā’s ornaments, he recognised only her anklets, because he had only ever looked at her feet.`
    ],
    moments: ['Follows Rāma to Viśvāmitra’s hermitage', 'Leaves everything to accompany Rāma into exile', 'Punishes Śūrpaṇakhā', 'Slays Atikāya with the Brahmāstra', 'Slays Indrajit at Nikumbhilā', 'Revived by Hanumān’s mountain of herbs']
  },
  {
    id: 'bharata', name: 'Bharata', dev: 'भरत', faction: 'raghu',
    title: 'The Brother Who Refused a Kingdom',
    lineage: 'Son of Daśaratha and Kaikeyī · Husband of Māṇḍavī',
    bio: [
      `Bharata was in Kekaya when his mother’s plot unfolded, and knew nothing of it. When he was offered the throne, he denounced Kaikeyī and walked barefoot to Citrakūṭa to beg Rāma to return.`,
      `When Rāma refused, Bharata carried his sandals back on his head and placed them on the throne. For fourteen years he lived as an ascetic at Nandigrāma, ruling only as their servant, and vowed to enter fire if Rāma were a single day late. He is one of the noblest figures of the epic, and proof that renunciation can be greater than possession.`
    ],
    moments: ['Rejects the throne his mother won for him', 'Pleads with Rāma at Citrakūṭa', 'Rules from Nandigrāma in Rāma’s name', 'Returns the kingdom “ten times greater”']
  },
  {
    id: 'shatrughna', name: 'Śatrughna', dev: 'शत्रुघ्न', faction: 'raghu',
    title: 'Slayer of Lavaṇa, Founder of Mathurā',
    lineage: 'Son of Daśaratha and Sumitrā · Twin of Lakṣmaṇa · Husband of Śrutakīrti',
    bio: [
      `Just as Lakṣmaṇa was devoted to Rāma, Śatrughna was devoted to Bharata. He stood by Bharata through the regency. In the Uttara Kāṇḍa, he slew the demon Lavaṇa, son of Madhu, and founded the city of Madhurā (Mathurā). The night he stayed at Vālmīki’s hermitage, Lava and Kuśa were born.`
    ],
    moments: ['Seizes Mantharā in anger (stopped by Bharata)', 'Slays Lavaṇāsura', 'Founds Mathurā', 'Follows Rāma into the Sarayū']
  },
  {
    id: 'dasharatha', name: 'Daśaratha', dev: 'दशरथ', faction: 'raghu',
    title: 'King of Kosala — Whose Chariot Could Ride in Ten Directions',
    lineage: 'Son of Aja, grandson of Raghu · Husband of Kausalyā, Kaikeyī and Sumitrā',
    bio: [
      `Daśaratha was a righteous and mighty king who had fought alongside the gods against the asuras. Childless for many years, he performed the Aśvamedha and Putrakāmeṣṭi sacrifices, and Viṣṇu was born as his four sons.`,
      `His tragedy was a promise. Bound by the two boons he had once granted Kaikeyī, he had to exile the son he loved more than life. In his youth he had accidentally killed a young ascetic, and the boy’s grieving father had cursed him to die of grief for his own son. On the sixth night after Rāma left, the curse was fulfilled. He appears again after the war, from heaven, to bless Rāma and Sītā.`
    ],
    moments: ['Performs the Putrakāmeṣṭi', 'Grants Kaikeyī two boons after the war with Śambara', 'Exiles Rāma, bound by his word', 'Dies crying Rāma’s name']
  },
  {
    id: 'kausalya', name: 'Kausalyā', dev: 'कौसल्या', faction: 'raghu',
    title: 'Mother of Śrī Rāma',
    lineage: 'Chief queen of Daśaratha · Princess of Kosala',
    bio: [
      `Kausalyā was the senior queen and mother of Rāma. She was gentle and devout, and spent her days in vows and worship. Her grief at Rāma’s exile is among the most heartbreaking passages of the Ayodhyā Kāṇḍa. Yet she blessed her son’s path with a mother’s prayer for his protection by every god and every power of nature. She received Bharata with suspicion and then with love when he swore his innocence.`
    ],
    moments: ['Gives birth to Rāma on Rāma Navamī', 'Blesses Rāma before exile', 'Comforts the dying Daśaratha']
  },
  {
    id: 'kaikeyi', name: 'Kaikeyī', dev: 'कैकेयी', faction: 'raghu',
    title: 'The Queen of the Two Boons',
    lineage: 'Daughter of King Aśvapati of Kekaya · Youngest and most beloved queen of Daśaratha · Mother of Bharata',
    bio: [
      `Kaikeyī was a warrior-queen. She drove Daśaratha’s chariot in the war against the asura Śambara and saved his life, and so earned two boons. She loved Rāma, and when she first heard of his coronation she gave Mantharā a jewel in joy.`,
      `Mantharā’s whispers turned that love into fear for Bharata’s future. She demanded Bharata’s coronation and Rāma’s fourteen-year exile. Her own son rejected her for it. In the tradition, her act is also seen as the instrument that set the divine mission in motion: without the exile, there would have been no Laṅkā.`
    ],
    moments: ['Saves Daśaratha in battle', 'Rejoices at Rāma’s coronation, then is turned by Mantharā', 'Claims the two boons', 'Rebuked by Bharata']
  },
  {
    id: 'sumitra', name: 'Sumitrā', dev: 'सुमित्रा', faction: 'raghu',
    title: 'Mother of Lakṣmaṇa and Śatrughna',
    lineage: 'Queen of Daśaratha',
    bio: [
      `Sumitrā received two portions of the divine pāyasa and bore twins. She is remembered for her wisdom and selflessness. As Lakṣmaṇa left for exile, she told him: “Know Rāma as Daśaratha, know Sītā as me, know the forest as Ayodhyā.” She consoled Kausalyā in her grief.`
    ],
    moments: ['Bears Lakṣmaṇa and Śatrughna', 'Blesses Lakṣmaṇa’s service to Rāma']
  },
  {
    id: 'urmila', name: 'Ūrmilā', dev: 'ऊर्मिला', faction: 'mithila',
    title: 'Wife of Lakṣmaṇa',
    lineage: 'Daughter of King Janaka · Younger sister of Sītā',
    bio: [
      `Ūrmilā married Lakṣmaṇa in the same ceremony in which Sītā married Rāma. When Lakṣmaṇa left with Rāma, she remained in Ayodhyā for fourteen years. Valmiki says little about her, but later poets made her a symbol of quiet sacrifice.`
    ],
    moments: ['Weds Lakṣmaṇa at Mithilā']
  },
  {
    id: 'mandavi', name: 'Māṇḍavī', dev: 'माण्डवी', faction: 'mithila',
    title: 'Wife of Bharata', lineage: 'Daughter of Kuśadhvaja, Janaka’s brother',
    bio: [`Māṇḍavī married Bharata in Mithilā, alongside her sister Śrutakīrti and her cousins Sītā and Ūrmilā. She was the daughter of Kuśadhvaja, king of Sāṅkāśya.`],
    moments: ['Weds Bharata at Mithilā']
  },
  {
    id: 'shrutakirti', name: 'Śrutakīrti', dev: 'श्रुतकीर्ति', faction: 'mithila',
    title: 'Wife of Śatrughna', lineage: 'Daughter of Kuśadhvaja',
    bio: [`Śrutakīrti, the younger daughter of Kuśadhvaja, married Śatrughna in the fourfold wedding at Mithilā.`],
    moments: ['Weds Śatrughna at Mithilā']
  },
  {
    id: 'janaka', name: 'Janaka', dev: 'जनक', faction: 'mithila',
    title: 'Rājarṣi of Videha — The Philosopher-King',
    lineage: 'King of Mithilā (Videha) · Descendant of Nimi · Father of Sītā and Ūrmilā',
    bio: [
      `Janaka was a king renowned for wisdom and detachment, a rājarṣi (royal sage). His ancestor Devarāta had been entrusted with Śiva’s bow, and Janaka kept it in Mithilā. While ploughing the sacrificial ground he found the infant Sītā in a furrow. He declared that she would marry only the man who could string the bow. When Rāma broke it, Janaka joyfully gave his daughters to the sons of Daśaratha.`
    ],
    moments: ['Finds Sītā in the earth', 'Guards Śiva’s bow', 'Gives Sītā’s hand to Rāma']
  },
  {
    id: 'sumantra', name: 'Sumantra', dev: 'सुमन्त्र', faction: 'raghu',
    title: 'Minister and Charioteer of Daśaratha',
    lineage: 'Chief among Daśaratha’s eight ministers',
    bio: [`Sumantra recalled the prophecy of Ṛṣyaśṛṅga that brought sons to the king. Years later he drove the exiles out of Ayodhyā and wept as he returned with an empty chariot.`],
    moments: ['Recalls the prophecy of Ṛṣyaśṛṅga', 'Drives Rāma into exile']
  },
  {
    id: 'guha', name: 'Guha', dev: 'गुह', faction: 'vanara',
    title: 'King of the Niṣādas — Rāma’s Friend',
    lineage: 'Ruler of Śṛṅgaverapura on the Gaṅgā',
    bio: [`Guha, king of the forest-dwelling Niṣādas, loved Rāma as his own life. He received the exiles at Śṛṅgaverapura, kept watch with Lakṣmaṇa through the night, and ferried them across the Gaṅgā. When Bharata came with an army, Guha prepared to fight him, until he saw Bharata’s tears.`],
    moments: ['Welcomes Rāma at Śṛṅgaverapura', 'Ferries the exiles across Gaṅgā', 'Tests and then honours Bharata']
  },
  {
    id: 'manthara', name: 'Mantharā', dev: 'मन्थरा', faction: 'raghu',
    title: 'The Hunchbacked Maid of Kaikeyī',
    lineage: 'Servant who came with Kaikeyī from Kekaya',
    bio: [`Mantharā watched the coronation preparations from a terrace and set out to ruin them. She played on Kaikeyī’s fears until the queen’s love for Rāma turned to suspicion, then reminded her of the two forgotten boons. Her whispers changed the course of the epic.`],
    moments: ['Poisons Kaikeyī’s mind', 'Seized by Śatrughna, spared at Bharata’s word']
  },
  {
    id: 'lava', name: 'Lava', dev: 'लव', faction: 'raghu',
    title: 'Younger Son of Rāma and Sītā', lineage: 'Born at Vālmīki’s hermitage · Later King of Śrāvastī',
    bio: [`Lava and his twin Kuśa were born at Vālmīki’s hermitage. He was named after the lower part (lava) of the kuśa grass used in his protective rites. The twins learned the Rāmāyaṇa from Vālmīki and sang it at Rāma’s Aśvamedha.`],
    moments: ['Sings the Rāmāyaṇa before Rāma', 'Crowned at Śrāvastī']
  },
  {
    id: 'kusha', name: 'Kuśa', dev: 'कुश', faction: 'raghu',
    title: 'Elder Son of Rāma and Sītā', lineage: 'Born at Vālmīki’s hermitage · Later King of Kuśāvatī',
    bio: [`The elder twin, named after the kuśa grass with which Vālmīki purified him. Together with Lava, he was the first singer of the Rāmāyaṇa. Rāma later crowned him in Kuśāvatī.`],
    moments: ['Sings the Rāmāyaṇa before Rāma', 'Crowned at Kuśāvatī']
  },

  // ───────── VANARAS & ALLIES ─────────
  {
    id: 'hanuman', name: 'Hanumān', dev: 'हनुमान्', faction: 'vanara', views: V('hanuman'),
    title: 'Āñjaneya, Mārutī, Pavanaputra — Servant of Rāma, Chiranjīvī',
    lineage: 'Son of Añjanā and Kesarī; spiritual son of Vāyu, the Wind God',
    weapon: 'Gadā (mace), boundless strength, the power to change size',
    bio: [
      `As an infant, Hanumān leapt at the rising sun thinking it a fruit, and Indra’s vajra struck his jaw (hanu). When Vāyu withdrew the breath of the world in anger, the gods appeased him with boons: invulnerability to weapons, immunity to the Brahmāstra, and wisdom from the Sun. Mischief in the hermitages earned him a curse: he would forget his powers until someone reminded him.`,
      `He is master of the Vedas, grammar and speech, and Rāma praised his flawless words at their first meeting. He leapt a hundred yojanas of ocean, found Sītā, burned Laṅkā, and twice carried a Himālayan mountain of herbs to save Rāma’s army. Asked what reward he wanted, he chose only to live as long as Rāma’s story is told. He is an immortal (cirañjīvī), present wherever the Rāmāyaṇa is sung.`
    ],
    moments: ['Leaps at the sun as a child', 'Meets Rāma at Ṛṣyamūka', 'Leaps the ocean; overcomes Surasā and Siṁhikā', 'Finds Sītā and gives her the ring', 'Sets Laṅkā on fire', 'Brings the mountain of herbs, twice', 'Receives Sītā’s pearl necklace']
  },
  {
    id: 'sugriva', name: 'Sugrīva', dev: 'सुग्रीव', faction: 'vanara',
    title: 'King of the Vānaras — Rāma’s Ally',
    lineage: 'Son of Sūrya (the Sun God) · Younger brother of Vālī · Husband of Rumā',
    bio: [
      `Sugrīva was driven from Kiṣkindhā by his brother Vālī, who believed he had been betrayed in the cave of Māyāvī, and lost his wife Rumā. He hid on Ṛṣyamūka hill, the one place Vālī could not enter, with Hanumān and three other loyal ministers.`,
      `His alliance with Rāma, sworn before fire, was the turning point of the war. After a lapse during the rains that earned Lakṣmaṇa’s wrath, he commanded the vast vānara armies with skill and fought in the front line at Laṅkā. He even bit off Kumbhakarṇa’s ears and nose to escape his grip.`
    ],
    moments: ['Exiled by Vālī', 'Pact of friendship with Rāma before Agni', 'Crowned King of Kiṣkindhā', 'Commands the vānara armies', 'Escapes Kumbhakarṇa']
  },
  {
    id: 'vali', name: 'Vālī', dev: 'वाली', faction: 'vanara',
    title: 'Mighty King of Kiṣkindhā',
    lineage: 'Son of Indra · Elder brother of Sugrīva · Husband of Tārā · Father of Angada',
    bio: [
      `Vālī was one of the strongest beings of his age. He killed the buffalo-demon Dundubhi and the asura Māyāvī. While performing his twilight worship by the sea, he caught Rāvaṇa himself under his arm and carried him across the four oceans, until Rāvaṇa asked for friendship.`,
      `His fall came when he drove out his brother and took his wife. Rāma’s arrow struck him while he fought Sugrīva. As he lay dying, Vālī questioned Rāma about dharma and accepted the answer. He entrusted his son Angada to Rāma and gave Sugrīva the golden necklace of Indra.`
    ],
    moments: ['Slays Dundubhi and Māyāvī', 'Humbles Rāvaṇa', 'Exiles Sugrīva', 'Falls to Rāma’s arrow; dialogue on dharma']
  },
  {
    id: 'tara', name: 'Tārā', dev: 'तारा', faction: 'vanara',
    title: 'Queen of Kiṣkindhā — Voice of Wisdom',
    lineage: 'Daughter of Suṣeṇa · Wife of Vālī · Mother of Angada',
    bio: [`Tārā was famed for her intelligence and foresight. She warned Vālī not to fight Sugrīva once Rāma had become his ally. Her lament over Vālī’s body is one of the epic’s great elegies. Later she calmed the furious Lakṣmaṇa at the gates of Kiṣkindhā with tact and wisdom.`],
    moments: ['Warns Vālī', 'Laments over Vālī', 'Calms Lakṣmaṇa’s anger']
  },
  {
    id: 'angada', name: 'Angada', dev: 'अङ्गद', faction: 'vanara',
    title: 'Crown Prince of Kiṣkindhā — Envoy to Rāvaṇa',
    lineage: 'Son of Vālī and Tārā',
    bio: [`Angada was made crown prince after his father’s death and led the southern search party. As Rāma’s envoy he stood in Rāvaṇa’s court and delivered the final ultimatum. When four rākṣasas seized him, he flew up with them, threw them down, and smashed the palace turret. In battle he slew Vajradaṁṣṭra, Narāntaka and Mahāpārśva.`],
    moments: ['Leads the southern search', 'Envoy to Rāvaṇa’s court', 'Slays Vajradaṁṣṭra and Narāntaka']
  },
  {
    id: 'jambavan', name: 'Jāmbavān', dev: 'जाम्बवान्', faction: 'vanara',
    title: 'King of the Bears — Eldest and Wisest',
    lineage: 'Born of Brahmā (from his yawn, says the epic)',
    bio: [`Jāmbavān, the ancient bear-king, had seen ages pass. On the seashore he reminded Hanumān of his birth and his forgotten powers. On the night of Indrajit’s Brahmāstra, lying gravely wounded, his first question was, “Is Hanumān alive?” He told Hanumān exactly where the herb mountain lay. Rāma blessed him to remain on earth until the end of the age.`],
    moments: ['Awakens Hanumān’s strength', '“Is Hanumān alive?”', 'Guides Hanumān to the herbs']
  },
  {
    id: 'nala', name: 'Nala', dev: 'नल', faction: 'vanara',
    title: 'Architect of the Setu', lineage: 'Son of Viśvakarmā, the divine architect',
    bio: [`Nala inherited his father Viśvakarmā’s skill. On the Ocean’s advice he built the Setu, a bridge a hundred yojanas long and ten wide, in five days, with the vānara army hauling trees and mountains to him.`],
    moments: ['Builds the Rāma Setu in five days']
  },
  {
    id: 'nila', name: 'Nīla', dev: 'नील', faction: 'vanara',
    title: 'Commander-in-Chief of the Vānara Army', lineage: 'Son of Agni, the Fire God',
    bio: [`Nīla led the vanguard on the march south, finding food and water for the army. At Laṅkā he held the eastern gate and slew Prahasta, Rāvaṇa’s commander-in-chief.`],
    moments: ['Leads the march', 'Slays Prahasta']
  },
  {
    id: 'sushena', name: 'Suṣeṇa', dev: 'सुषेण', faction: 'vanara',
    title: 'Vānara Physician and General', lineage: 'Son of Varuṇa · Father of Tārā',
    bio: [`Suṣeṇa was the father of Tārā and a healer skilled in herbs. When Rāvaṇa’s spear felled Lakṣmaṇa, he sent Hanumān to Mount Mahodaya for the healing herbs and revived Lakṣmaṇa with them.`],
    moments: ['Revives Lakṣmaṇa']
  },
  {
    id: 'jatayu', name: 'Jaṭāyu', dev: 'जटायु', faction: 'vanara',
    title: 'King of Vultures — First Martyr for Sītā',
    lineage: 'Son of Aruṇa (charioteer of the Sun) · Younger brother of Sampāti · Friend of Daśaratha',
    bio: [
      `The aged vulture Jaṭāyu, an old friend of Daśaratha, offered to guard Sītā at Pañcavaṭī. When Rāvaṇa carried her away, Jaṭāyu, sixty thousand years old, attacked the ten-headed king. He smashed his chariot and killed his charioteer and donkeys.`,
      `Rāvaṇa cut off his wings with his sword. Jaṭāyu lived just long enough to tell Rāma which way Sītā had been taken. Rāma performed his funeral rites with his own hands, as he would for his father.`
    ],
    moments: ['Pledges to guard Sītā', 'Battles Rāvaṇa in the sky', 'Dies in Rāma’s arms; cremated by Rāma']
  },
  {
    id: 'sampati', name: 'Sampāti', dev: 'सम्पाति', faction: 'vanara',
    title: 'The Wingless Vulture Who Saw Laṅkā', lineage: 'Elder brother of Jaṭāyu · Son of Aruṇa',
    bio: [`In their youth Sampāti and Jaṭāyu raced toward the sun. Sampāti spread his wings to shield his brother and they burned. He fell to earth, wingless, and the sage Niśākara foretold that they would grow again when he served Rāma. Grieving Jaṭāyu’s death, he looked across a hundred yojanas of ocean and told the vānaras that Sītā was in Laṅkā. At that moment his wings returned.`],
    moments: ['Shields Jaṭāyu from the sun', 'Sees Sītā across the sea', 'Regains his wings']
  },
  {
    id: 'shabari', name: 'Śabarī', dev: 'शबरी', faction: 'rishi',
    title: 'The Ascetic Who Waited', lineage: 'Disciple of the sages of Mataṅga’s hermitage, by Lake Pampā',
    bio: [`Śabarī was a forest-dwelling woman who served the sages of Mataṅga’s hermitage. When they ascended to heaven, they told her that Rāma would come. She waited for years. When he arrived, she offered him forest fruits and showed him her teachers’ grove. Then, with his blessing, she gave up her body in fire and ascended. She is the great example of devotion that knows no caste or condition.`],
    moments: ['Waits for Rāma for years', 'Offers Rāma forest fruits', 'Ascends to heaven by yoga-fire']
  },

  // ───────── RISHIS ─────────
  {
    id: 'valmiki', name: 'Maharṣi Vālmīki', dev: 'वाल्मीकि', faction: 'rishi',
    title: 'Ādi Kavi — The First Poet',
    lineage: 'Son of Pracetas (as he states in the Uttara Kāṇḍa)',
    bio: [
      `Vālmīki composed the Rāmāyaṇa after Nārada told him Rāma’s story and Brahmā commanded him to sing it. His first verse came out of grief, when a hunter shot one of a pair of krauñca birds. His name is traditionally said to come from valmīka (anthill), because he sat in such deep penance that ants built a mound over him.`,
      `He is also a character in his own poem. Rāma visits his hermitage at Citrakūṭa. He shelters the exiled Sītā, raises Lava and Kuśa, teaches them the epic, and testifies to Sītā’s purity in Rāma’s assembly.`
    ],
    moments: ['Hears Rāma’s story from Nārada', 'Mā Niṣāda: the first śloka', 'Shelters Sītā and raises Lava & Kuśa', 'Testifies for Sītā']
  },
  {
    id: 'narada', name: 'Devarṣi Nārada', dev: 'नारद', faction: 'rishi',
    title: 'The Celestial Sage', lineage: 'Mind-born son of Brahmā',
    bio: [`Nārada travels the three worlds singing the glory of Nārāyaṇa. He answered Vālmīki’s question about the most virtuous man alive by telling Rāma’s whole story in brief. This summary, the Saṅkṣepa Rāmāyaṇa, opens the epic.`],
    moments: ['Narrates Rāma’s story to Vālmīki']
  },
  {
    id: 'vasishtha', name: 'Maharṣi Vasiṣṭha', dev: 'वसिष्ठ', faction: 'rishi',
    title: 'Royal Preceptor of the Ikṣvākus', lineage: 'Brahmarṣi, mind-born son of Brahmā · Husband of Arundhatī',
    bio: [`Vasiṣṭha was the family guru of the Solar dynasty. He counselled Daśaratha to entrust Rāma to Viśvāmitra, led the rites in Ayodhyā, and crowned Rāma after the war. Long before, his wish-fulfilling cow Śabalā had caused his great rivalry with King Kauśika, who became Viśvāmitra.`],
    moments: ['Defeats Kauśika with his brahma-daṇḍa', 'Advises Daśaratha', 'Crowns Rāma']
  },
  {
    id: 'vishwamitra', name: 'Brahmarṣi Viśvāmitra', dev: 'विश्वामित्र', faction: 'rishi',
    title: 'The King Who Became a Brahmarṣi', lineage: 'Born King Kauśika, son of Gādhi, of the line of Kuśa',
    bio: [
      `Viśvāmitra began life as King Kauśika. Humbled by Vasiṣṭha, he renounced his kingdom and through thousands of years of penance rose step by step: rājarṣi, ṛṣi, maharṣi, and finally brahmarṣi. He was tested by Menakā and Rambhā, and by his own anger and pride. He created a heaven for Triśaṅku and saved Śunaḥśepa. He is the seer of the Gāyatrī mantra.`,
      `In the Rāmāyaṇa he is Rāma’s first great teacher. He took the young prince from Ayodhyā, taught him Balā and Atibalā, gave him the divine astras, guided him to Tāṭakā, Siddhāśrama, Ahalyā and Mithilā, and led him to Sītā.`
    ],
    moments: ['Takes Rāma and Lakṣmaṇa from Ayodhyā', 'Gives Rāma the divine astras', 'Leads Rāma to Śiva’s bow']
  },
  {
    id: 'parashurama', name: 'Paraśurāma', dev: 'परशुराम', faction: 'rishi',
    title: 'Bhārgava Rāma — Sixth Avatāra of Viṣṇu',
    lineage: 'Son of the sage Jamadagni and Reṇukā · Of the Bhṛgu line',
    weapon: 'Paraśu (axe) given by Śiva; the bow of Viṣṇu',
    bio: [`After King Kārtavīrya Arjuna’s line killed his father Jamadagni, Paraśurāma wiped out the kṣatriyas twenty-one times. He then gave the earth to Kaśyapa and withdrew to Mount Mahendra. Angered that Rāma had broken Śiva’s bow, he met him on the road and challenged him to string Viṣṇu’s bow. When Rāma strung it effortlessly, Paraśurāma recognised Viṣṇu in him and gave up the worlds he had won by penance.`],
    moments: ['Challenges Rāma with Viṣṇu’s bow', 'Recognises Rāma as Viṣṇu']
  },
  {
    id: 'agastya', name: 'Maharṣi Agastya', dev: 'अगस्त्य', faction: 'rishi',
    title: 'Tamer of the South — Teacher of the Ādityahṛdayam',
    lineage: 'Born of Mitra and Varuṇa · Husband of Lopāmudrā',
    bio: [`Agastya made the southern lands safe for sages. He humbled the Vindhya mountain, digested the demon Vātāpi, and once drank the ocean. He cursed Tāṭakā and Mārīca into rākṣasas. He gave Rāma Viṣṇu’s bow, Brahmā’s arrow and inexhaustible quivers, and sent him to Pañcavaṭī. At the height of the final battle he taught Rāma the Ādityahṛdayam. In the Uttara Kāṇḍa he tells Rāma the histories of Rāvaṇa and Hanumān.`],
    moments: ['Curses Tāṭakā and Mārīca', 'Arms Rāma in the forest', 'Teaches the Ādityahṛdayam', 'Narrates the Uttara Kāṇḍa histories']
  },
  {
    id: 'bharadwaja', name: 'Maharṣi Bharadvāja', dev: 'भरद्वाज', faction: 'rishi',
    title: 'Sage of Prayāga', lineage: 'Disciple of Vālmīki',
    bio: [`At the confluence of Gaṅgā and Yamunā, Bharadvāja hosted the exiles and guided them to Citrakūṭa. By his ascetic power he later gave Bharata’s entire army a heavenly feast. Rāma stopped at his hermitage on the way home.`],
    moments: ['Directs Rāma to Citrakūṭa', 'Feasts Bharata’s army']
  },
  {
    id: 'atri', name: 'Maharṣi Atri', dev: 'अत्रि', faction: 'rishi',
    title: 'One of the Seven Sages', lineage: 'Mind-born son of Brahmā · Husband of Anasūyā',
    bio: [`Atri, one of the Saptarṣis, welcomed the exiles to his hermitage as they left Citrakūṭa and introduced them to his wife Anasūyā.`],
    moments: ['Hosts the exiles']
  },
  {
    id: 'anasuya', name: 'Anasūyā', dev: 'अनसूया', faction: 'rishi',
    title: 'The Great Ascetic Woman', lineage: 'Wife of Atri',
    bio: [`Anasūyā’s penance once made the Gaṅgā flow and ended a ten-year drought. She praised Sītā’s devotion and gave her a divine garland, garments, ornaments and an unguent that would keep her radiant forever.`],
    moments: ['Blesses and adorns Sītā']
  },
  {
    id: 'ahalya', name: 'Ahalyā', dev: 'अहल्या', faction: 'rishi',
    title: 'Wife of Gautama — Freed by Rāma', lineage: 'Created by Brahmā · Mother of Śatānanda',
    bio: [`Indra, disguised as Gautama, came to Ahalyā. Gautama cursed her to remain unseen for thousands of years, living on air and lying in ashes, purified by penance, until Rāma came. When Rāma entered the hermitage, she appeared radiant, and the brothers touched her feet. She was reunited with her husband.`],
    moments: ['Freed from her curse by Rāma’s arrival']
  },
  {
    id: 'rishyasringa', name: 'Ṛṣyaśṛṅga', dev: 'ऋष्यशृङ्ग', faction: 'rishi',
    title: 'The Sage Who Brought Sons to Daśaratha', lineage: 'Son of Vibhāṇḍaka · Son-in-law of King Romapāda',
    bio: [`Raised in the forest, Ṛṣyaśṛṅga had never seen a woman until he was lured to the kingdom of Aṅga, where his arrival ended a drought. A prophecy of Sanatkumāra foretold that he would bring sons to the Ikṣvāku king. He performed the Putrakāmeṣṭi that brought forth the divine pāyasa.`],
    moments: ['Performs the Putrakāmeṣṭi']
  },

  // ───────── DIVINE ─────────
  {
    id: 'vishnu', name: 'Lord Viṣṇu', dev: 'विष्णु', faction: 'divine',
    title: 'Nārāyaṇa — Preserver of the Universe',
    lineage: 'The Supreme, who takes avatāras to restore dharma',
    weapon: 'Sudarśana cakra, Pāñcajanya conch, Kaumodakī mace, Śārṅga bow',
    bio: [`When the gods pleaded for deliverance from Rāvaṇa, Viṣṇu agreed to be born as the four sons of Daśaratha: Rāma, Bharata, Lakṣmaṇa and Śatrughna. His bow reaches Rāma through Paraśurāma and his weapons through Agastya. After the Agni Parīkṣā, Brahmā reveals that Rāma is Nārāyaṇa and Sītā is Lakṣmī. At the end, Rāma returns to his Viṣṇu form in the Sarayū.`],
    moments: ['Agrees to incarnate as Rāma', 'Destroys Mālī; drives Sumālī to Pātāla', 'Revealed in Rāma by Brahmā']
  },
  {
    id: 'shiva', name: 'Lord Śiva', dev: 'शिव', faction: 'divine',
    title: 'Mahādeva — Lord of Kailāsa',
    lineage: 'The Auspicious One · Husband of Pārvatī',
    weapon: 'Pināka bow, triśūla',
    bio: [`Śiva’s bow, entrusted to Janaka’s ancestor Devarāta, was the test for Sītā’s hand. He received Gaṅgā in his locks when she descended. When Rāvaṇa tried to uproot Kailāsa, Śiva pressed it down with his toe, then named him “Rāvaṇa” and gave him the sword Candrahāsa. He is among the gods who appear after Sītā’s ordeal by fire. The Rāma-nāma śloka that opens this site is spoken by Śiva to Pārvatī.`],
    moments: ['His bow broken by Rāma', 'Receives Gaṅgā in his locks', 'Humbles Rāvaṇa at Kailāsa']
  },
  {
    id: 'brahma', name: 'Lord Brahmā', dev: 'ब्रह्मा', faction: 'divine',
    title: 'The Creator — Grandfather of the Worlds',
    lineage: 'Born from the lotus of Viṣṇu’s navel',
    bio: [`Brahmā gave the boons that made Rāvaṇa nearly invincible, Kumbhakarṇa’s sleep, and Vibhīṣaṇa’s steadfastness in dharma. He commanded Vālmīki to compose the Rāmāyaṇa and had the gods bring forth the vānaras. His Brahmāstra decides the final battle. After Sītā’s ordeal, it is Brahmā who declares Rāma to be Nārāyaṇa.`],
    moments: ['Inspires Vālmīki', 'Grants Rāvaṇa’s boon', 'Reveals Rāma’s divinity']
  },
  {
    id: 'indra', name: 'Indra', dev: 'इन्द्र', faction: 'divine',
    title: 'King of the Devas', lineage: 'Lord of Svarga · Father of Vālī',
    weapon: 'Vajra (thunderbolt)',
    bio: [`Indra struck the infant Hanumān with his vajra, and was once captured by Indrajit. His wrongdoing with Ahalyā brought Gautama’s curse. At the climax of the war he sent his own chariot, driven by Mātali, to Rāma. Afterwards, at Rāma’s request, he restored every fallen vānara to life.`],
    moments: ['Strikes young Hanumān', 'Sends his chariot to Rāma', 'Revives the vānara army']
  },
  {
    id: 'agni', name: 'Agni', dev: 'अग्नि', faction: 'divine',
    title: 'God of Fire — Witness of Truth', lineage: 'Father of Nīla',
    bio: [`Agni witnessed the pact between Rāma and Sugrīva. He stayed cool on Hanumān’s tail at Sītā’s prayer. When Sītā entered the pyre, Agni rose from the flames carrying her unharmed and declared her purity.`],
    moments: ['Spares Hanumān at Sītā’s prayer', 'Returns Sītā from the fire']
  },
  {
    id: 'vayu', name: 'Vāyu', dev: 'वायु', faction: 'divine',
    title: 'God of Wind — Father of Hanumān',
    bio: [`When Indra struck his son, Vāyu withdrew the breath from all beings until the gods made amends. In the war he whispered to Lakṣmaṇa the secret of defeating Atikāya.`],
    moments: ['Withdraws the world’s breath for Hanumān', 'Advises Lakṣmaṇa against Atikāya']
  },
  {
    id: 'garuda', name: 'Garuḍa', dev: 'गरुड', faction: 'divine',
    title: 'King of Birds — Vāhana of Viṣṇu',
    bio: [`When Indrajit’s serpent-arrows bound Rāma and Lakṣmaṇa, Garuḍa, the eternal foe of serpents, descended in a great wind. The serpents fled at his coming and the brothers were healed.`],
    moments: ['Frees Rāma and Lakṣmaṇa from the nāga-pāśa']
  },
  {
    id: 'samudra', name: 'Samudra', dev: 'समुद्र', faction: 'divine',
    title: 'Lord of the Ocean',
    bio: [`Samudra rose with folded hands when Rāma set the Brahmāstra on his bow. He explained that he could not abandon his nature, but would hold firm whatever was built upon him, and he named Nala as the builder.`],
    moments: ['Advises the building of the Setu']
  },

  // ───────── RAKSHASAS ─────────
  {
    id: 'ravana', name: 'Rāvaṇa', dev: 'रावण', faction: 'rakshasa', views: ['assets/characters/ravana-front.jpg'], // ten heads; side/back art pending (see PROMPTS.md)
    title: 'Daśagrīva, Daśānana — The Ten-Headed Lord of Laṅkā',
    lineage: 'Son of the sage Viśravas and the rākṣasī Kaikasī · Grandson of Pulastya · Half-brother of Kubera · Husband of Mandodarī',
    weapon: 'Candrahāsa sword (gift of Śiva), Puṣpaka vimāna, the boon of Brahmā',
    bio: [
      `Born with ten heads to a brāhmaṇa sage and a rākṣasa princess, Daśagrīva was a scholar of the Vedas, a great musician and a fierce ascetic. He offered nine of his heads into the sacred fire for Brahmā’s boon. Then he drove Kubera from Laṅkā, seized the Puṣpaka, lifted Kailāsa, and conquered the three worlds. Śiva named him Rāvaṇa, “he who made the worlds cry.”`,
      `His greatness was matched by his arrogance and lust, and each excess earned a curse. Nandī foretold that monkeys would destroy him, Vedavatī vowed to be reborn for his ruin, and Nalakūbara’s curse kept him from forcing himself upon Sītā. He ignored every warning: Mārīca, Vibhīṣaṇa, Kumbhakarṇa, Mandodarī. At last he fell to the Brahmāstra of Rāma, the human he had counted as straw.`
    ],
    moments: ['Penance at Gokarṇa; boon of Brahmā', 'Lifts Kailāsa; named by Śiva', 'Abducts Sītā', 'Exiles Vibhīṣaṇa', 'Rāma spares him once: “Go and return rested”', 'Slain by the Brahmāstra']
  },
  {
    id: 'kumbhakarna', name: 'Kumbhakarṇa', dev: 'कुम्भकर्ण', faction: 'rakshasa',
    title: 'The Giant Who Slept',
    lineage: 'Son of Viśravas and Kaikasī · Brother of Rāvaṇa · Father of Kumbha and Nikumbha',
    bio: [`Kumbhakarṇa was a colossal rākṣasa whose hunger frightened the gods. When he was about to receive Brahmā’s boon, Sarasvatī entered his tongue so that he asked for sleep instead. Woken for the war, he plainly told Rāvaṇa he had done wrong. Still, out of loyalty, he marched out to die for him. He devoured thousands of vānaras and carried off Sugrīva before Rāma cut him down limb by limb.`],
    moments: ['His boon turned to sleep by Sarasvatī', 'Rebukes Rāvaṇa, yet fights for him', 'Slain by Rāma']
  },
  {
    id: 'vibhishana', name: 'Vibhīṣaṇa', dev: 'विभीषण', faction: 'rakshasa',
    title: 'The Righteous Rākṣasa — King of Laṅkā, Chiranjīvī',
    lineage: 'Youngest son of Viśravas and Kaikasī · Husband of Saramā',
    bio: [`Vibhīṣaṇa asked Brahmā only for a mind that never strays from dharma. In Rāvaṇa’s court he alone defended Hanumān’s right as an envoy and urged Sītā’s return. When Rāvaṇa kicked him away, he flew to Rāma and surrendered. Rāma granted him refuge with his great vow of śaraṇāgati and crowned him on the seashore. His knowledge of Laṅkā’s secrets, especially Indrajit’s sacrifice at Nikumbhilā, was decisive.`],
    moments: ['Defends Hanumān in court', 'Surrenders to Rāma; crowned on the shore', 'Reveals the Nikumbhilā secret', 'Crowned King of Laṅkā']
  },
  {
    id: 'indrajit', name: 'Indrajit (Meghanāda)', dev: 'इन्द्रजित्', faction: 'rakshasa',
    title: 'Conqueror of Indra — Master of Illusion',
    lineage: 'Eldest son of Rāvaṇa and Mandodarī',
    weapon: 'Nāga-pāśa, Brahmāstra, invisibility, illusion',
    bio: [`Born roaring like thunder, Meghanāda captured Indra himself and was named Indrajit by Brahmā. He was the most dangerous warrior in Laṅkā. He bound Hanumān with the Brahmāstra, bound Rāma and Lakṣmaṇa with serpent-arrows, felled the entire army with the Brahmāstra, and killed an illusory Sītā to break their spirits. Lakṣmaṇa slew him after Vibhīṣaṇa led them to disrupt his sacrifice at Nikumbhilā.`],
    moments: ['Captures Indra', 'Binds Hanumān', 'Nāga-pāśa on Rāma & Lakṣmaṇa', 'The Brahmāstra night', 'Slain by Lakṣmaṇa']
  },
  {
    id: 'mandodari', name: 'Mandodarī', dev: 'मन्दोदरी', faction: 'rakshasa',
    title: 'Chief Queen of Laṅkā',
    lineage: 'Daughter of the asura architect Maya and the apsarā Hemā · Wife of Rāvaṇa · Mother of Indrajit',
    bio: [`Mandodarī was radiant and wise. Her beauty was such that Hanumān briefly mistook her for Sītā. Over Rāvaṇa’s body she lamented that one woman’s abduction had ruined the conqueror of the worlds, and she recognised Rāma as the eternal Viṣṇu.`],
    moments: ['Mistaken for Sītā by Hanumān', 'Laments over Rāvaṇa']
  },
  {
    id: 'shurpanakha', name: 'Śūrpaṇakhā', dev: 'शूर्पणखा', faction: 'rakshasa',
    title: 'She of the Winnowing-Fan Nails',
    lineage: 'Daughter of Viśravas and Kaikasī · Sister of Rāvaṇa',
    bio: [`Śūrpaṇakhā lived in the Daṇḍaka forest. She desired Rāma, and when she was rejected she tried to devour Sītā, so Lakṣmaṇa cut off her nose and ears. She sent Khara’s fourteen thousand to their deaths, then went to Rāvaṇa and inflamed him with descriptions of Sītā. That set the war in motion.`],
    moments: ['Confronts Rāma at Pañcavaṭī', 'Incites Khara', 'Incites Rāvaṇa']
  },
  {
    id: 'mareecha', name: 'Mārīca', dev: 'मारीच', faction: 'rakshasa',
    title: 'The Golden Deer',
    lineage: 'Son of the yakṣī Tāṭakā and Sunda · Cursed into rākṣasa form by Agastya',
    bio: [
      `Mārīca was born a yakṣa, son of Tāṭakā. When he and his mother attacked the sage Agastya, Agastya cursed him to become a rākṣasa. He served Rāvaṇa and was sent to defile Viśvāmitra’s sacrifice. There young Rāma’s Mānavāstra struck him and flung him a hundred yojanas into the ocean.`,
      `He survived, became an ascetic, and lived in terror of Rāma. He said he saw Rāma behind every tree, and even words beginning with “ra” frightened him. He begged Rāvaṇa not to provoke Rāma. Forced to choose between death by Rāvaṇa and death by Rāma, he chose Rāma. He became the golden deer, and with his dying breath he cried out in Rāma’s voice.`
    ],
    moments: ['Cursed with his mother by Agastya', 'Hurled into the ocean by the Mānavāstra', 'Warns Rāvaṇa against Rāma', 'Becomes the golden deer']
  },
  {
    id: 'subahu', name: 'Subāhu', dev: 'सुबाहु', faction: 'rakshasa',
    title: 'Defiler of Sacrifices',
    lineage: 'Companion of Mārīca (in many tellings, also Tāṭakā’s son)',
    bio: [`Subāhu and Mārīca, servants of Rāvaṇa, rained blood and flesh on the altar of Viśvāmitra’s sacrifice at Siddhāśrama. On the sixth day of the sacrifice, Rāma struck Subāhu with the Āgneyāstra, the fire-weapon, and killed him.`],
    moments: ['Attacks Viśvāmitra’s sacrifice', 'Slain by Rāma’s Āgneyāstra']
  },
  {
    id: 'tataka', name: 'Tāṭakā', dev: 'ताटका', faction: 'rakshasa',
    title: 'The Yakṣī of the Desolate Forest',
    lineage: 'Daughter of the yakṣa Suketu · Wife of Sunda · Mother of Mārīca',
    bio: [
      `Tāṭakā was born a yakṣī, granted by Brahmā to her father Suketu, and had the strength of a thousand elephants. When the sage Agastya’s curse killed her husband Sunda, she and her son Mārīca rushed to devour the sage. Agastya cursed her to lose her beauty and become a man-eating rākṣasī.`,
      `She turned the rich lands of Malada and Karūṣa into a wasteland. The young Rāma hesitated to strike a woman. Viśvāmitra taught him that a protector of the people must stop one who kills the innocent, and Rāma pierced her heart with one arrow. It was his first battle.`
    ],
    moments: ['Cursed by Agastya', 'Lays waste to Malada and Karūṣa', 'Slain by young Rāma']
  },
  {
    id: 'kaikesi', name: 'Kaikasī', dev: 'कैकसी', faction: 'rakshasa',
    title: 'Mother of Rāvaṇa',
    lineage: 'Daughter of the rākṣasa king Sumālī · Wife of the sage Viśravas',
    bio: [
      `When Viṣṇu drove the rākṣasas into Pātāla, her father Sumālī longed to restore their glory. Seeing Kubera in the Puṣpaka, he sent Kaikasī to the sage Viśravas to bear sons of equal power.`,
      `She approached the sage at dusk, a fearsome hour, and he foretold that her sons would be terrible rākṣasas. At her plea, he promised that the youngest would be righteous. She bore Rāvaṇa, Kumbhakarṇa, Śūrpaṇakhā and Vibhīṣaṇa. Her taunt comparing Rāvaṇa with Kubera drove him to the penance that won him his boon.`
    ],
    moments: ['Sent by Sumālī to Viśravas', 'Mother of Rāvaṇa, Kumbhakarṇa, Śūrpaṇakhā, Vibhīṣaṇa', 'Spurs Rāvaṇa to penance']
  },
  {
    id: 'sumali', name: 'Sumālī', dev: 'सुमाली', faction: 'rakshasa',
    title: 'The Exiled Rākṣasa King', lineage: 'Son of Sukeśa · Brother of Mālyavān and Mālī · Father of Kaikasī',
    bio: [`Sumālī and his brothers once ruled Laṅkā, built for them by Viśvakarmā. Viṣṇu destroyed Mālī and drove the survivors into Pātāla. Sumālī schemed to restore their glory through his grandson Rāvaṇa. His son Prahasta became Rāvaṇa’s commander-in-chief.`],
    moments: ['Driven to Pātāla by Viṣṇu', 'Sends Kaikasī to Viśravas']
  },
  {
    id: 'khara', name: 'Khara', dev: 'खर', faction: 'rakshasa',
    title: 'Lord of Janasthāna', lineage: 'Cousin of Rāvaṇa',
    bio: [`Khara ruled Janasthāna in the Daṇḍaka forest with Dūṣaṇa and Triśiras. To avenge Śūrpaṇakhā he marched with fourteen thousand rākṣasas against Rāma alone. Rāma destroyed the entire army in about an hour and slew Khara with an arrow given by Indra.`],
    moments: ['Leads 14,000 against Rāma', 'Slain at Janasthāna']
  },
  {
    id: 'dushana', name: 'Dūṣaṇa', dev: 'दूषण', faction: 'rakshasa',
    title: 'General of Janasthāna',
    bio: [`Dūṣaṇa was Khara’s general. He commanded the vanguard of the fourteen thousand and fell to Rāma’s arrows.`],
    moments: ['Slain by Rāma at Janasthāna']
  },
  {
    id: 'kabandha', name: 'Kabandha', dev: 'कबन्ध', faction: 'rakshasa',
    title: 'The Headless Monster',
    lineage: 'Once Danu, son of Śrī; cursed by the sage Sthūlaśiras and struck by Indra',
    bio: [`Cursed into a hideous form, Kabandha challenged Indra, whose vajra drove his head and legs into his body. He had a single eye on his chest, a mouth in his belly, and arms a yojana long. Rāma and Lakṣmaṇa cut off his arms and cremated him. He rose in divine form and told them to seek Sugrīva.`],
    moments: ['Seizes the brothers', 'Freed; directs Rāma to Sugrīva']
  },
  {
    id: 'viradha', name: 'Virādha', dev: 'विराध', faction: 'rakshasa',
    title: 'First Demon of the Daṇḍaka', lineage: 'Once the gandharva Tumburu, cursed by Kubera',
    bio: [`Virādha seized Sītā as the exiles entered the forest. A boon made weapons useless against him, so Rāma and Lakṣmaṇa broke his arms and buried him alive. Freed, he recalled that he was Tumburu, a gandharva, and ascended to heaven.`],
    moments: ['Seizes Sītā', 'Buried and freed']
  },
  {
    id: 'trijata', name: 'Trijaṭā', dev: 'त्रिजटा', faction: 'rakshasa',
    title: 'The Kind Rākṣasī', lineage: 'Guardian in the Aśoka grove',
    bio: [`Trijaṭā was an elderly rākṣasī guard. She dreamed of Rāma’s victory and Rāvaṇa’s ruin and warned the other guards to stop tormenting Sītā. When Sītā saw the brothers bound by serpent-arrows, Trijaṭā consoled her.`],
    moments: ['The dream of Rāma’s victory', 'Consoles Sītā']
  },
  {
    id: 'akshakumara', name: 'Akṣakumāra', dev: 'अक्षकुमार', faction: 'rakshasa',
    title: 'Young Prince of Laṅkā', lineage: 'Son of Rāvaṇa',
    bio: [`Akṣakumāra was a brilliant young warrior. He rode out in a golden chariot against Hanumān in the ruined Aśoka grove. Hanumān admired his valour, then seized him by the feet, whirled him and struck him to the ground.`],
    moments: ['Duel with Hanumān']
  },
  {
    id: 'atikaya', name: 'Atikāya', dev: 'अतिकाय', faction: 'rakshasa',
    title: 'The Giant in Brahmā’s Armour', lineage: 'Son of Rāvaṇa and Dhānyamālinī',
    bio: [`Atikāya was mountain-sized and wore armour given by Brahmā that no ordinary weapon could pierce. Lakṣmaṇa exhausted astra after astra against him until Vāyu whispered that only the Brahmāstra would work. With it, Lakṣmaṇa beheaded him.`],
    moments: ['Duel with Lakṣmaṇa']
  },
  {
    id: 'prahasta', name: 'Prahasta', dev: 'प्रहस्त', faction: 'rakshasa',
    title: 'Commander-in-Chief of Laṅkā', lineage: 'Son of Sumālī · Rāvaṇa’s uncle',
    bio: [`Prahasta was Rāvaṇa’s chief general. He led a vast army out of the eastern gate and was slain by Nīla, son of Agni, with a great rock.`],
    moments: ['Slain by Nīla']
  },
  {
    id: 'kubera', name: 'Kubera', dev: 'कुबेर', faction: 'divine',
    title: 'Lord of Wealth — Rāvaṇa’s Half-Brother', lineage: 'Son of Viśravas · Guardian of the North',
    bio: [`Through penance Kubera (Vaiśravaṇa) became Lord of Wealth, received the Puṣpaka from Brahmā, and ruled the empty city of Laṅkā. His half-brother Rāvaṇa drove him out and seized the vimāna. Kubera then ruled from Alakā in the Himālaya.`],
    moments: ['Rules Laṅkā first', 'Driven out by Rāvaṇa']
  },
  // ───────── added with their own art (painted in the style of the character sheets) ─────────
  {
    id: 'vishwakarma', name: 'Viśvakarmā', dev: 'विश्वकर्मा', faction: 'divine',
    title: 'Architect of the Gods', lineage: 'The divine craftsman · Father of Nala',
    bio: [`Viśvakarmā is the builder of the worlds. He built the golden city of Laṅkā on Mount Trikūṭa, fashioned the flying Puṣpaka for Brahmā, and made the great bows of Śiva and Viṣṇu. When the sage Bharadvāja honoured Bharata’s army, he called upon Viśvakarmā, and palaces rose in the forest. His son Nala built the bridge to Laṅkā with his father’s skill.`],
    moments: ['Builds golden Laṅkā', 'Fashions the bows of Śiva and Viṣṇu', 'Raises palaces for Bharadvāja’s feast']
  },
  {
    id: 'uma', name: 'Umā (Pārvatī)', dev: 'उमा', faction: 'divine',
    title: 'Daughter of the Himālaya', lineage: 'Daughter of Himavān and Menā · Sister of Gaṅgā · Consort of Śiva',
    bio: [`Umā performed fierce penance and was given in marriage to Lord Śiva. When the gods asked Śiva to hold back his energy so that no child of such might would be born, Umā, denied a child, cursed the gods and the Earth.`],
    moments: ['Marriage to Śiva', 'Her curse upon the gods']
  },
  {
    id: 'kartikeya', name: 'Kārttikeya', dev: 'कार्त्तिकेय', faction: 'divine',
    title: 'Commander of the Armies of Heaven', lineage: 'Born of Śiva’s energy, carried by Agni and Gaṅgā',
    bio: [`Born on the slopes of the Himālaya from the energy of Śiva that Agni and Gaṅgā carried, the radiant child was nursed by the six Kṛttikās and so was called Kārttikeya and Ṣaṇmukha. He became the commander of the armies of the gods.`],
    moments: ['Nursed by the six Kṛttikās', 'Leads the armies of heaven']
  },
  {
    id: 'sagara', name: 'Sagara', dev: 'सगर', faction: 'raghu',
    title: 'Ancestor King of Ayodhyā', lineage: 'King of the Ikṣvāku line · Father of sixty thousand sons',
    bio: [`King Sagara, Rāma’s ancestor, began an Aśvamedha, but Indra stole the horse. His sixty thousand sons dug through the earth to find it and were burned to ashes by the sage Kapila. Only Gaṅgā’s waters could give them peace.`],
    moments: ['The lost sacrificial horse', 'The ashes of his sons']
  },
  {
    id: 'kapila', name: 'Kapila', dev: 'कपिल', faction: 'rishi',
    title: 'The Sage Beneath the Earth', lineage: 'Vāsudeva, Lord Viṣṇu himself',
    bio: [`Deep beneath the earth, Sagara’s sixty thousand sons found their horse grazing near the sage Kapila. Calling him a thief, they rushed at him, and with a single roar he burned them all to ashes.`],
    moments: ['Burns the sixty thousand to ashes']
  },
  {
    id: 'bhagiratha', name: 'Bhagīratha', dev: 'भगीरथ', faction: 'raghu',
    title: 'Who Brought Gaṅgā to Earth', lineage: 'Son of Dilīpa · Ikṣvāku line',
    bio: [`Bhagīratha left his kingdom and performed a thousand years of penance so that Gaṅgā would descend and give his ancestors peace. He stood for a year on the tip of one toe until Śiva agreed to receive her fall. Gaṅgā followed his chariot across the earth and down into the netherworld, and is called Bhāgīrathī after him.`],
    moments: ['A thousand years of penance', 'Gaṅgā follows his chariot']
  },
  {
    id: 'ganga', name: 'Gaṅgā', dev: 'गङ्गा', faction: 'divine',
    title: 'The Heavenly River', lineage: 'Elder daughter of Himavān · Called Jāhnavī and Bhāgīrathī',
    bio: [`Gaṅgā went to heaven to purify the worlds. At Bhagīratha’s prayer she fell to earth, meaning to sweep Śiva into the netherworld, but Śiva caught her in his matted locks. Released, she flowed after Bhagīratha’s chariot and over the ashes of Sagara’s sons, who rose to heaven. Sītā prayed to her for a safe return as the exiles crossed.`],
    moments: ['Falls into Śiva’s locks', 'Frees the sons of Sagara']
  },
  {
    id: 'diti', name: 'Diti', dev: 'दिति', faction: 'divine',
    title: 'Mother of the Daityas', lineage: 'Wife of the sage Kaśyapa',
    bio: [`Grieving for her slain sons, Diti asked Kaśyapa for a son who would slay Indra, and kept a vow of purity for a thousand years while Indra served her. When she broke the vow, Indra cut the unborn child into seven parts, and at her request they became the Maruts, guardians of the winds.`],
    moments: ['The vow of a thousand years', 'Mother of the Maruts']
  },
  {
    id: 'gautama', name: 'Gautama', dev: 'गौतम', faction: 'rishi',
    title: 'Husband of Ahalyā', lineage: 'Father of Śatānanda, priest of Janaka',
    bio: [`The sage Gautama cursed Indra, and cursed Ahalyā to remain unseen in their hermitage, living on air, until Rāma came. When Rāma entered and Ahalyā was freed, Gautama returned and the two were reunited.`],
    moments: ['Curses Indra and Ahalyā', 'Reunited with Ahalyā']
  },
  {
    id: 'menaka', name: 'Menakā', dev: 'मेनका', faction: 'divine',
    title: 'Celestial Dancer of Indra’s Court', lineage: 'An apsarā',
    bio: [`Sent by the gods to break Viśvāmitra’s penance at Puṣkara, Menakā lived with him for ten years, until he woke as if from a dream and gently sent her away.`],
    moments: ['Breaks Viśvāmitra’s penance']
  },
  {
    id: 'matali', name: 'Mātali', dev: 'मातलि', faction: 'divine',
    title: 'Charioteer of Indra', lineage: 'Celestial charioteer',
    bio: [`When Rāma fought Rāvaṇa on foot, Indra sent his own chariot with Mātali to drive it, along with his armour, bow and spear. At the height of the battle Mātali reminded Rāma to use the Brahmāstra ordained for Rāvaṇa’s death.`],
    moments: ['Brings Indra’s chariot', 'Reminds Rāma of the Brahmāstra']
  },
  {
    id: 'bhudevi', name: 'Bhūdevī', dev: 'भूदेवी', faction: 'divine',
    title: 'Mother Earth', lineage: 'Mādhavī, the Earth Goddess · Mother of Sītā',
    bio: [`When Sītā, in the Naimiṣa forest, called on the Earth to receive her if she had never thought of anyone but Rāma, the ground split open and Bhūdevī rose on a divine throne carried by nāgas. She embraced her daughter, seated her beside her, and they descended into the earth as flowers rained from the sky.`],
    moments: ['Receives Sītā into the earth']
  },
  {
    id: 'kala', name: 'Kāla', dev: 'काल', faction: 'divine',
    title: 'Time Himself', lineage: 'Sent by Brahmā',
    bio: [`After many years Kāla came to Rāma disguised as an ascetic and asked to speak in private, on the condition that anyone who interrupted would be put to death. He told Rāma that his mission on earth was complete and the time had come to return.`],
    moments: ['The private council with Rāma']
  },
  {
    id: 'durvasa', name: 'Durvāsā', dev: 'दुर्वासा', faction: 'rishi',
    title: 'The Fiery Sage', lineage: 'Son of Atri and Anasūyā',
    bio: [`Durvāsā arrived while Kāla spoke with Rāma and demanded to see him at once, threatening to curse the whole dynasty. To save his family, Lakṣmaṇa entered, and so fulfilled the condition that led to his departure.`],
    moments: ['Demands to see Rāma']
  },
  {
    id: 'malyavan', name: 'Mālyavān', dev: 'माल्यवान्', faction: 'rakshasa',
    title: 'Elder of the Rākṣasas', lineage: 'Elder brother of Sumālī · Rāvaṇa’s maternal grand-uncle',
    bio: [`Mālyavān once held golden Laṅkā with his brothers until Viṣṇu drove them out. In old age he came to Rāvaṇa’s council and urged peace: the omens were terrible, the rākṣasas had abandoned dharma, and Rāma was Viṣṇu himself. Rāvaṇa answered with contempt, and Mālyavān went home in silence.`],
    moments: ['Counsels peace']
  },
  {
    id: 'lankini', name: 'Laṅkinī', dev: 'लङ्किनी', faction: 'rakshasa',
    title: 'Guardian of the City of Laṅkā', lineage: 'The city itself in bodily form',
    bio: [`At the gate of Laṅkā the city’s guardian struck Hanumān, and he struck her down with his left fist, holding back his strength. She remembered Brahmā’s words, that when a vānara defeated her the end of the rākṣasas had come, and let him pass.`],
    moments: ['Struck down by Hanumān']
  },
  {
    id: 'sarama', name: 'Saramā', dev: 'सरमा', faction: 'rakshasa',
    title: 'The Kind Rākṣasī', lineage: 'Wife of Vibhīṣaṇa',
    bio: [`When Rāvaṇa showed Sītā an illusion of Rāma’s death, the kind Saramā, Vibhīṣaṇa’s wife, revealed the trick and comforted her.`],
    moments: ['Comforts Sītā']
  }
];

// Names for minor figures who appear in episodes without a full profile.
export const MINOR_NAMES = {
  kushanabha: 'Kuśanābha', uma: 'Umā (Pārvatī)', kartikeya: 'Kārttikeya', sagara: 'Sagara', kapila: 'Kapila', amshuman: 'Aṁśumān', bhagiratha: 'Bhagīratha', ganga: 'Gaṅgā', vasuki: 'Vāsuki', diti: 'Diti', trishanku: 'Triśaṅku', ambarisha: 'Ambarīṣa', shunashepa: 'Śunaḥśepa', menaka: 'Menakā', siddhartha: 'Siddhārtha', malyavan: 'Mālyavān', mahaparshva: 'Mahāpārśva', virupaksha: 'Virūpākṣa', mahodara: 'Mahodara', kumbha: 'Kumbha', nikumbha: 'Nikumbha', makaraksha: 'Makarākṣa', narantaka: 'Narāntaka', anaranya: 'Anaraṇya', shambuka: 'Śambūka', ila: 'Ila', sudhanva: 'Sudhanvā',
  akampana: 'Akampana', mayavi: 'Māyāvī', dundubhi: 'Dundubhi', swayamprabha: 'Svayamprabhā',
  mainaka: 'Maināka', surasa: 'Surasā', simhika: 'Siṁhikā', lankini: 'Laṅkā (city guardian)',
  kakasura: 'Kākāsura (the crow)', 'shuka-sarana': 'Śuka & Sāraṇa', vidyujjihva: 'Vidyujjihva',
  matali: 'Mātali', saraswati: 'Sarasvatī', nandi: 'Nandī', vedavati: 'Vedavatī',
  kartavirya: 'Kārtavīrya Arjuna', rambha: 'Rambhā', nalakubara: 'Nalakūbara', surya: 'Sūrya',
  bhadra: 'Bhadra', lavanasura: 'Lavaṇāsura', bhudevi: 'Bhūdevī', kala: 'Kāla (Time)', durvasa: 'Durvāsā'
};
