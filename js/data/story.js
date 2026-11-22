// The Śrīmad Rāmāyaṇa, told as one flowing kathā, Kāṇḍa by Kāṇḍa.
// Built from tools/data/story/*.txt by tools/build_story.mjs; edit those files, not this one.
// `chars` reference ids in characters.js; `place` references ids in places.js.
// Scene choreography and sarga references for each episode live in scenes.js (keyed by kāṇḍa and episode index).

export const PROLOGUE = {
  "id": "prologue",
  "num": 0,
  "name": "Prologue",
  "dev": "उपोद्घात",
  "subtitle": "How the First Poem Was Born",
  "accent": "#f4c96b",
  "summary": "Before the story of Rāma was sung, it had to be heard. It begins not in Ayodhyā but in a quiet hermitage on the banks of the Tamasā, with a question asked by a sage, and with a grief so deep that it became the first verse of poetry on earth.",
  "episodes": [
    {
      "title": "The Question of Vālmīki",
      "dev": "नारद-वाल्मीकि संवाद",
      "chars": [
        "valmiki",
        "narada"
      ],
      "text": [
        "Long ago, in a peaceful hermitage on the banks of the river Tamasā, there lived the sage Vālmīki, devoted to austerity and the study of the Vedas. One morning the celestial sage Nārada descended to his hermitage, his vīṇā glowing in his hands and the name of Nārāyaṇa on his lips. Vālmīki bowed at his feet and asked the question that had long lived in his heart. “O holy one, is there anyone in this world today who is truly virtuous and valiant, who knows dharma, who is grateful, truthful and firm in his vows? Is there one who is kind to every living being, whose anger even the gods fear, and yet who has conquered anger itself?”",
        "Nārada smiled, for this was the question he loved most of all. “Such a man has been born, O sage, in the royal line of Ikṣvāku, and the world knows him as Rāma.” Then Nārada told him the whole story in brief: the exile, the loss of Sītā, the friendship of the vānaras, the bridge across the sea, the fall of Rāvaṇa and the reign of righteousness that followed. When Nārada had gone back to the heavens, Vālmīki sat for a long time in silence, his heart overflowing with Rāma."
      ],
      "place": "valmiki-ashram"
    },
    {
      "title": "Mā Niṣāda — The First Verse",
      "dev": "मा निषाद",
      "chars": [
        "valmiki",
        "brahma",
        "lava",
        "kusha"
      ],
      "text": [
        "Walking down to the Tamasā to bathe, Vālmīki saw a pair of krauñca birds singing together on a branch, inseparable and joyful. Suddenly a hunter’s arrow struck the male, and he fell bleeding to the ground while his mate circled above him, crying out in anguish. The sage’s heart broke with compassion, and words burst from his lips in a perfect, measured verse.",
        "“Mā niṣāda pratiṣṭhāṁ tvam agamaḥ śāśvatīḥ samāḥ.” “O hunter, may you never find rest through endless years, for you have struck down one of this devoted pair.” His grief, his śoka, had become a śloka, a verse.",
        "Then Lord Brahmā, the Creator, appeared in the hermitage, radiant upon his lotus, and blessed the trembling sage. “This verse was born by my will, O Vālmīki. Sing now the whole story of Rāma, and every hidden moment of it shall be revealed to you.” Seated in deep meditation, Vālmīki saw the entire story unfold before his inner eye, as clearly as a fruit held in the palm of his hand. He composed it in twenty-four thousand verses and taught it to two radiant boys of his hermitage, Lava and Kuśa, who sang it with voices as sweet as the vīṇā. And this is the story they sang."
      ],
      "place": "tamasa"
    }
  ]
};

export const KANDAS = [
  {
    "id": "bala",
    "num": 1,
    "name": "Bāla Kāṇḍa",
    "dev": "बालकाण्ड",
    "subtitle": "The Book of Youth",
    "accent": "#f4c96b",
    "summary": "The gods pray for deliverance from Rāvaṇa, and Lord Viṣṇu is born as Rāma, the son of King Daśaratha. Under the sage Viśvāmitra the young prince slays Tāṭakā, guards a holy sacrifice, frees Ahalyā from her stone form, breaks the great bow of Śiva in Mithilā and is wedded to Sītā, the daughter of the Earth.",
    "episodes": [
      {
        "title": "Ayodhyā and the King Without a Son",
        "dev": "अयोध्या",
        "chars": [
          "dasharatha",
          "vasishtha",
          "sumantra"
        ],
        "text": [
          "On the banks of the shining Sarayū, in the fair land of Kosala, stood Ayodhyā, the city that could never be conquered, founded long ago by Manu, the father of mankind. Its royal roads were broad and sprinkled with water and flowers, its palaces gleamed with gold, and from every rooftop the banners of the Sun dynasty flew in the wind. Scholars chanted the Vedas in its courtyards, music drifted from its halls, and no one in that city was poor, unlearned or unkind.",
          "Its king was Daśaratha, descendant of Ikṣvāku and Raghu, who loved his people as a father loves his children. His preceptor was the great sage Vasiṣṭha, and his most faithful minister was Sumantra. Yet behind the king’s gentle smile there lay a deep sorrow. He had grown old, and he had no son to carry on the sacred line of the Sun."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Sacrifice for Sons",
        "dev": "पुत्रकामेष्टि यज्ञ",
        "chars": [
          "dasharatha",
          "rishyasringa",
          "vasishtha",
          "sumantra"
        ],
        "text": [
          "One day the king opened his heart to his counsellors. “I long for a son, and I will perform the great horse sacrifice to win the grace of the gods.” Sumantra bowed and said, “O King, long ago the sage Sanatkumāra foretold that the holy Ṛṣyaśṛṅga would bless your house with sons.” Joyfully the king brought the gentle forest sage to Ayodhyā with every honour.",
          "On the northern bank of the Sarayū the horse sacrifice was completed, and then Ṛṣyaśṛṅga began the Putrakāmeṣṭi, the sacred rite for the gift of sons. The fire leapt high and bright as the hymns were chanted, and offerings of ghee streamed into the flames."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Prayer of the Gods",
        "dev": "देवताओं की प्रार्थना",
        "chars": [
          "brahma",
          "vishnu",
          "indra",
          "garuda"
        ],
        "text": [
          "At that very hour, high in the realm of the gods, the devas gathered before Lord Brahmā in great distress. “Rāvaṇa, the king of the rākṣasas, proud of your boon, torments the three worlds,” they cried. “No god, no demon and no celestial being can slay him.” Brahmā reflected and said, “In his pride he asked to be safe from every being except man, for he thought men too weak to matter. Only a man can end him.”",
          "Then the whole sky filled with light, and Lord Viṣṇu came riding upon Garuḍa, dark as a rain cloud, clad in yellow silk, bearing the conch, the discus, the mace and the lotus. The gods fell at His feet and prayed that He be born on earth as a man. Viṣṇu smiled with boundless compassion. “Fear not. I shall be born as the son of King Daśaratha, and I shall destroy Rāvaṇa and restore dharma to the world.” Brahmā then asked the gods to send forth mighty vānaras and bears, born of their own power, to serve the Lord in His mission."
        ]
      },
      {
        "title": "The Divine Pāyasa",
        "dev": "दिव्य पायस",
        "chars": [
          "dasharatha",
          "kausalya",
          "kaikeyi",
          "sumitra"
        ],
        "text": [
          "Back on earth, a radiant being rose from the sacrificial fire, holding a golden vessel covered with a silver lid. “I come from Prajāpati, O King. Give this divine pāyasa to your queens, and sons will be born to you.” Daśaratha received it as a poor man receives a treasure, and bowed low before the fire.",
          "He gave half of the pāyasa to Kausalyā, his eldest queen. Of what remained he gave a share to Sumitrā, a share to Kaikeyī, and the last share again to Sumitrā. The three queens received it with folded hands, and soon each of them shone with the light of the divine child she carried."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Birth of Śrī Rāma",
        "dev": "श्रीराम जन्म",
        "chars": [
          "rama",
          "kausalya",
          "dasharatha",
          "kaikeyi",
          "sumitra"
        ],
        "text": [
          "Twelve months passed. On the ninth day of the bright fortnight of Caitra, at the hour of noon, the Lord revealed Himself to Queen Kausalyā in His radiant four-armed form. Trembling with joy, she folded her hands and prayed, “O Lord, become my little child.” At once He lay in her arms as a newborn baby and began to cry, and Kausalyā held Rāma to her heart.",
          "Kaikeyī gave birth to Bharata, and Sumitrā to twin sons, Lakṣmaṇa and Śatrughna. The gandharvas sang in the sky, drums sounded in the heavens, and flowers rained down upon Ayodhyā. The whole city danced, the king gave cows, gold and grain to all who came, and lamps glowed in every home. To this day that holy day is celebrated as Rāma Navamī."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Four Brothers",
        "dev": "बाल्यकाल",
        "chars": [
          "rama",
          "lakshmana",
          "bharata",
          "shatrughna",
          "kausalya",
          "dasharatha"
        ],
        "text": [
          "The four princes grew like the moon in the bright fortnight. Little Rāma toddled through the palace halls with his tiny anklets ringing, and his mothers forgot every care just to watch him play. Once he cried for the moon itself, and Kausalyā laughed and held up a golden bowl of water, so that the moon smiled up at him from inside it.",
          "In time the brothers went to study under Guru Vasiṣṭha, and mastered the Vedas, archery, and the riding of horses, elephants and chariots. From birth Lakṣmaṇa was devoted to Rāma, like a second life breathing outside his body, and would neither eat nor sleep without him. In the same way Śatrughna was devoted to Bharata. Rāma was the joy of all, gentle in speech, firm in truth, and dearer to his father than his own life."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Viśvāmitra Asks for Rāma",
        "dev": "विश्वामित्र आगमन",
        "chars": [
          "vishwamitra",
          "dasharatha",
          "vasishtha",
          "rama",
          "lakshmana"
        ],
        "text": [
          "One day the mighty sage Viśvāmitra arrived at the court of Ayodhyā, blazing with the power of his penance. Daśaratha rose from his throne, washed the sage’s feet and promised, “Whatever you ask, O holy one, I shall give.” Viśvāmitra said, “Two rākṣasas, Mārīca and Subāhu, defile my sacrifice by raining blood and flesh upon the altar. Give me your son Rāma for ten days, and he will destroy them.”",
          "The old king turned pale and trembled. “Rāma is not yet sixteen, and he has never seen battle! Take my whole army, take me instead, but do not take my child.” The sage’s eyes flashed with anger, and the hall seemed to tremble. Then Vasiṣṭha spoke gently: “O King, a promise once given must be kept. Rāma will be safe with Viśvāmitra, who knows every divine weapon.” Daśaratha embraced his son and let him go, and Lakṣmaṇa, as always, followed his brother."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Balā and Atibalā",
        "dev": "बला-अतिबला",
        "chars": [
          "vishwamitra",
          "rama",
          "lakshmana"
        ],
        "text": [
          "By the southern bank of the Sarayū, Viśvāmitra taught Rāma two sacred mantras, Balā and Atibalā, which keep away hunger, thirst and weariness and grant unmatched strength. That night the princes slept on beds of soft grass beneath the stars. At dawn the sage woke them with the words still sung in temples every morning: “Kausalyā suprajā Rāma, pūrvā sandhyā pravartate.” “Rāma, beloved son of Kausalyā, the dawn has come; arise, O tiger among men.”"
        ]
      },
      {
        "title": "Tāṭakā",
        "dev": "ताटका वध",
        "chars": [
          "tataka",
          "rama",
          "lakshmana",
          "vishwamitra"
        ],
        "text": [
          "They came to a dark and terrible forest where no bird sang and no deer grazed. “This land was once rich and happy,” said Viśvāmitra, “but now it is haunted by Tāṭakā, a fearsome demoness with the strength of a thousand elephants, who devours every traveller.” Rāma hesitated. “Must I raise my bow against a woman, O sage?” Viśvāmitra replied, “To protect the innocent is a prince’s highest duty. One who destroys the helpless must not be spared.”",
          "Then Tāṭakā came roaring out of the forest, raising a storm of dust and hurling great rocks. Rāma twanged his bowstring, and its sound rang through the forest like thunder. His arrows shattered her storm of stones, and as she rushed at him, he loosed a single arrow that pierced her heart. She fell like a mountain, and the forest breathed again. The gods showered flowers and blessed the young prince."
        ],
        "place": "tataka-forest"
      },
      {
        "title": "The Gift of the Divine Weapons",
        "dev": "दिव्यास्त्र प्रदान",
        "chars": [
          "vishwamitra",
          "rama",
          "lakshmana"
        ],
        "text": [
          "Pleased with Rāma, Viśvāmitra faced the east and gave him the divine astras: the discus of Dharma, the discus of Time, the Brahmāstra, the fiery Āgneya, the windy Vāyavya and many more. One by one the weapons appeared before Rāma in shining forms, with folded hands. “We are your servants, O Rāma; command us.” Rāma touched them gently and said, “Dwell in my mind, and come whenever I call.”"
        ],
        "place": "siddhashrama"
      },
      {
        "title": "Guarding the Sacrifice",
        "dev": "यज्ञ रक्षा",
        "chars": [
          "rama",
          "lakshmana",
          "mareecha",
          "subahu",
          "vishwamitra"
        ],
        "text": [
          "At Siddhāśrama, where Lord Viṣṇu Himself had once performed penance, Viśvāmitra began his six-day sacrifice in silence. Day and night the two princes stood guard with their bows drawn, never closing their eyes.",
          "On the sixth day the sky darkened, and Mārīca and Subāhu swooped down with their hordes, ready to pour blood upon the sacred fire. Rāma loosed the Mānava weapon at Mārīca, and it hurled him a hundred yojanas away into the ocean, alive but trembling forever. With the fire weapon Rāma struck down Subāhu, and with the wind weapon he scattered the rest like dry leaves. The sacrifice was completed, and the sages blessed the princes with joy."
        ],
        "place": "siddhashrama"
      },
      {
        "title": "The Descent of Gaṅgā",
        "dev": "गङ्गावतरण",
        "chars": [
          "vishwamitra",
          "bhagiratha",
          "ganga",
          "shiva",
          "rama"
        ],
        "text": [
          "As they journeyed north toward Mithilā and reached the holy Gaṅgā, Viśvāmitra told the princes how the river had come down from heaven. Long ago the sixty thousand sons of King Sagara, Rāma’s own ancestors, had been burned to ashes by the sage Kapila, and only the heavenly Gaṅgā could purify them. Generations later King Bhagīratha left his throne and stood in penance for a thousand years, praying for Gaṅgā to descend.",
          "Gaṅgā agreed to come, but the earth could not bear the force of her fall. So Bhagīratha prayed to Lord Śiva, and Śiva stood upon the Himālaya and caught the mighty river in his matted locks. Then he released her gently, and Gaṅgā followed Bhagīratha’s chariot across the land to the ashes of his ancestors, who rose to heaven in light. “Whoever hears this story,” said Viśvāmitra, “is cleansed of every sin.”"
        ],
        "place": "himalaya"
      },
      {
        "title": "Ahalyā Freed",
        "dev": "अहल्या उद्धार",
        "chars": [
          "ahalya",
          "rama",
          "lakshmana",
          "vishwamitra",
          "gautama"
        ],
        "text": [
          "Near Mithilā they came upon a silent, empty hermitage where a great stone lay among the grass. “This was the hermitage of the sage Gautama,” said Viśvāmitra. “His wife Ahalyā was deceived by Indra, who came in the form of her husband, and the sage in his anger cursed her to lie here as a stone, until the dust of Rāma’s feet should touch her.”",
          "Gently Rāma stepped forward, and the moment the dust of his feet touched the stone, a radiant light rose from it. Ahalyā stood before him, glowing like a flame freed from smoke, her hands folded and her eyes full of tears. She bowed at the Lord’s feet, the heavens showered flowers, and the sage Gautama returned to take her home."
        ],
        "place": "ahalya-ashram"
      },
      {
        "title": "The Tale of Viśvāmitra",
        "dev": "विश्वामित्र चरित",
        "chars": [
          "vishwamitra",
          "vasishtha",
          "janaka"
        ],
        "text": [
          "In Mithilā King Janaka welcomed the sage and the princes with great honour, and his priest Śatānanda told the wondrous story of Viśvāmitra. Once he had been King Kauśika, a mighty ruler of the earth. Visiting the hermitage of Vasiṣṭha, he desired the sage’s wish-fulfilling cow, Kāmadhenu, and tried to take her by force.",
          "But the divine cow brought forth armies that scattered his soldiers, and every weapon the king hurled was swallowed by Vasiṣṭha’s simple wooden staff. Humbled, the king cried, “Shame on the strength of a warrior; the strength of a sage is the true strength!” He gave up his throne and went into the forest to perform penance.",
          "For thousands of years he strove, and again and again anger and pride broke his penance. At last he conquered even these, stilled his very breath and sat unmoving until the worlds trembled with his power. Then Brahmā and all the gods declared him a Brahmarṣi, and Vasiṣṭha himself embraced him as an equal and a friend."
        ],
        "place": "mithila"
      },
      {
        "title": "The Garden of Mithilā",
        "dev": "पुष्पवाटिका",
        "chars": [
          "rama",
          "sita",
          "lakshmana"
        ],
        "text": [
          "The next morning Rāma and Lakṣmaṇa went into King Janaka’s flower garden to gather flowers for their guru’s worship. At the same hour Princess Sītā came there with her companions to worship the goddess Gaurī in her temple beside the lotus pond. For a single moment Rāma and Sītā beheld each other across the garden, and in silence each recognised the one destined since the beginning of time.",
          "Sītā entered the temple of Gaurī and prayed with folded hands, “O Mother, grant me the one my heart has chosen.” The garland upon the goddess’s image slipped gently down, and the goddess smiled. “Your wish shall be fulfilled, my child; the one your heart has chosen shall be yours.”"
        ],
        "place": "mithila"
      },
      {
        "title": "The Bow of Śiva",
        "dev": "शिव धनुष भङ्ग",
        "chars": [
          "rama",
          "janaka",
          "sita",
          "vishwamitra",
          "lakshmana"
        ],
        "text": [
          "Then Janaka told the sages the story of his daughter. “Once, as I ploughed the sacred ground, a radiant baby girl rose from the furrow of the earth. I named her Sītā and raised her as my own, a daughter of Mother Earth herself.” He had vowed to give her only to the hero who could string the mighty bow of Lord Śiva, which no one could even lift.",
          "The great hall filled with kings and princes from every land, and the bow was brought in its iron casket on a cart of eight wheels, drawn by hundreds of men. One by one the proudest kings tried, and not one of them could even move it. Janaka cried out in sorrow, “Is the earth empty of heroes?” Lakṣmaṇa’s eyes blazed, but Rāma waited calmly for his guru’s word.",
          "At a sign from Viśvāmitra, Rāma rose, bowed to his guru, and lifted the great bow as lightly as a garland of flowers. He strung it in a single breath, and as he drew the string to his ear, the bow broke in the middle with a crash like thunder. The earth shook, the hall fell silent, and flowers rained from the heavens. Sītā came forward with lowered eyes, carrying the garland of victory, and placed it around Rāma’s neck."
        ],
        "place": "mithila"
      },
      {
        "title": "Paraśurāma’s Wrath",
        "dev": "परशुराम संवाद",
        "chars": [
          "parashurama",
          "rama",
          "lakshmana",
          "janaka"
        ],
        "text": [
          "Suddenly a terrible figure strode into the hall, a great axe upon his shoulder and a bow in his hand, his eyes burning like fire. It was Paraśurāma, the warrior sage who had humbled the kings of the earth twenty-one times. “Who has broken the bow of my master Śiva?” he thundered, and the kings shrank back in fear.",
          "Rāma bowed before him with folded hands. “O holy one, the one who broke the bow is your humble servant.” Paraśurāma held out the great bow of Viṣṇu. “If you are truly so mighty, string this.” Rāma took the bow, strung it without effort, and set a divine arrow upon it.",
          "In that moment Paraśurāma saw the eternal Viṣṇu shining in the young prince. His anger melted away, and he folded his hands. “You are the Lord Himself. Forgive me.” He walked around Rāma in reverence and departed for Mount Mahendra to continue his penance."
        ],
        "place": "mithila"
      },
      {
        "title": "Four Weddings in Mithilā",
        "dev": "सीता-राम विवाह",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "urmila",
          "bharata",
          "mandavi",
          "shatrughna",
          "shrutakirti",
          "dasharatha",
          "janaka"
        ],
        "text": [
          "Messengers raced to Ayodhyā, and King Daśaratha came with his court, with Bharata and Śatrughna and with the sage Vasiṣṭha. Mithilā was decked with flowers, banners and lamps, and the whole city sang. Four marriages were blessed that day: Rāma with Sītā, Lakṣmaṇa with Ūrmilā, Bharata with Māṇḍavī, and Śatrughna with Śrutakīrti.",
          "Before the sacred fire, Janaka placed Sītā’s hand in Rāma’s. “This is my daughter Sītā. She will walk with you in dharma as your own shadow; take her hand in yours.” Rāma and Sītā walked around the sacred fire seven times as the sages chanted, and the gods showered flowers from above."
        ],
        "place": "mithila"
      },
      {
        "title": "Return to Ayodhyā",
        "dev": "अयोध्या आगमन",
        "chars": [
          "rama",
          "sita",
          "dasharatha",
          "kausalya",
          "kaikeyi",
          "sumitra"
        ],
        "text": [
          "The wedding procession returned to Ayodhyā amid music, conches and showers of flowers. The three queens welcomed their sons and daughters-in-law at the palace gates with lamps and blessings. Soon afterwards Bharata and Śatrughna went to visit their grandfather in the kingdom of Kekaya. Rāma and Sītā lived in Ayodhyā for twelve happy years, devoted to each other and to dharma, each understanding the other’s heart without a word."
        ],
        "place": "ayodhya"
      }
    ]
  },
  {
    "id": "ayodhya",
    "num": 2,
    "name": "Ayodhyā Kāṇḍa",
    "dev": "अयोध्याकाण्ड",
    "subtitle": "The Book of Ayodhyā",
    "accent": "#ff9f43",
    "summary": "On the eve of Rāma’s coronation, Mantharā’s whispers turn Queen Kaikeyī against him, and she claims two old boons: the throne for her son Bharata, and fourteen years of exile for Rāma. Rāma accepts with a smile. Sītā and Lakṣmaṇa follow him into the forest, King Daśaratha dies of grief, and Bharata, refusing the throne, rules only as the servant of Rāma’s sandals.",
    "episodes": [
      {
        "title": "The Coronation Is Announced",
        "dev": "राज्याभिषेक की घोषणा",
        "chars": [
          "dasharatha",
          "rama",
          "vasishtha"
        ],
        "text": [
          "Years passed, and King Daśaratha saw white hair in his mirror. He called together the princes, the elders and the people of Kosala, and spoke from his golden throne. “I have served this land for many thousands of years, and now I wish to rest. With your blessing, I will crown my son Rāma as prince regent.” The great hall rang with cheers of joy. “Let it be Rāma!” cried the people. “He is the best of men, and he loves us as his own.”",
          "The coronation was fixed for the very next morning, when the moon would enter the star Puṣya. Vasiṣṭha blessed Rāma, and that night Rāma and Sītā kept a vigil of fasting and prayer before the sacred fire. All through the night Ayodhyā decorated itself: the streets were washed and strewn with flowers, lamps were lit on every balcony, and the whole city waited for the dawn."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Mantharā’s Poison",
        "dev": "मंथरा",
        "chars": [
          "manthara",
          "kaikeyi"
        ],
        "text": [
          "From the palace roof, Mantharā, the hunchbacked maid of Queen Kaikeyī, saw the city glowing with festive lamps. When she learned that Rāma was to be crowned, she hurried to Kaikeyī’s chamber, burning with jealousy. Kaikeyī, who loved Rāma as her own son, smiled with delight and gave her a precious necklace for the happy news. Mantharā flung it to the floor. “Foolish queen! When Rāma is king, Kausalyā will rule, and you and your son Bharata will become her servants.”",
          "Day and night Mantharā had served Kaikeyī, and her words slowly crept into the queen’s heart like poison. “Remember the two boons the king once promised you, when you saved his life on the battlefield,” she whispered. “Ask for them now. Let Bharata be crowned, and let Rāma be sent to the forest for fourteen years.” The queen’s face darkened, and the love in her heart was clouded by fear."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Chamber of Anger",
        "dev": "कोपभवन",
        "chars": [
          "kaikeyi",
          "dasharatha"
        ],
        "text": [
          "Kaikeyī tore off her jewels, cast away her garland and lay upon the bare floor of the chamber of anger, her hair unbound. When the king came joyfully to share the good news, he found her there and was struck with alarm. “My beloved queen, who has hurt you? Tell me, and I shall do whatever you wish. I swear it on the life of Rāma.”",
          "At that oath Kaikeyī rose. “Then remember the two boons you promised me long ago. By the first, let my son Bharata be crowned. By the second, let Rāma go into the Daṇḍaka forest for fourteen years, wearing bark and deerskin like a hermit.” The king staggered as if struck by lightning and fell senseless to the ground."
        ],
        "place": "ayodhya"
      },
      {
        "title": "A Father’s Agony",
        "dev": "दशरथ विलाप",
        "chars": [
          "dasharatha",
          "kaikeyi",
          "sumantra"
        ],
        "text": [
          "All night the old king wept and pleaded at her feet. “What wrong has Rāma ever done to you? He has served you more lovingly than even his own mother. Ask for anything else, take my kingdom, take my life, but do not send my Rāma away.” Kaikeyī was unmoved. “You are a king of the Sun dynasty. Will you break your word?”",
          "The night passed like an age of sorrow. At dawn the musicians gathered to wake the king for the coronation, and Sumantra came to say that all was ready. But the broken king could only whisper, “Bring Rāma to me.”"
        ],
        "place": "ayodhya"
      },
      {
        "title": "Rāma Accepts with a Smile",
        "dev": "राम वनवास स्वीकार",
        "chars": [
          "rama",
          "dasharatha",
          "kaikeyi"
        ],
        "text": [
          "Rāma came at once, radiant in his coronation robes, and found his father lying on the floor, unable to speak. He bowed and asked Kaikeyī, “Mother, what grieves my father? Tell me, and I shall set it right.” Then Kaikeyī told him of the two boons.",
          "Rāma did not tremble, and the light in his face did not fade. “Is that all, Mother? For my father’s word I would gladly give my life. I shall go to the forest this very day, and Bharata shall rule.” For as it has been sung ever since, “Raghukula rīti sadā chali āī, prāna jāhu baru bachanu na jāī”: in the line of Raghu it has always been the way that life may go, but a promise never. He bowed at his father’s feet and at Kaikeyī’s, and walked out of the palace as calmly as he had walked in."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Mother Kausalyā’s Blessing",
        "dev": "कौसल्या का आशीर्वाद",
        "chars": [
          "rama",
          "kausalya",
          "lakshmana"
        ],
        "text": [
          "In his mother’s chambers Kausalyā was praying for his coronation. When Rāma told her the news, she fell to the ground like a plantain tree cut by an axe. Lakṣmaṇa’s eyes flamed with anger. “Brother, this is injustice! Say the word, and I will take the kingdom for you by force.” Rāma laid a gentle hand upon his shoulder. “Lakṣmaṇa, our father’s truth is our dharma. It is fate, not Mother Kaikeyī, that has done this.”",
          "At last Kausalyā understood that her son’s resolve could not be shaken. She lit a lamp before the gods, tied a sacred thread of protection upon his wrist, and blessed him with trembling hands. “Go, my son. May the dharma that you guard so faithfully guard you in the forest, and may you return safely to me.”"
        ],
        "place": "ayodhya"
      },
      {
        "title": "Sītā’s Resolve",
        "dev": "सीता का निश्चय",
        "chars": [
          "rama",
          "sita"
        ],
        "text": [
          "Rāma went to Sītā and told her that he must leave for the forest. “Stay here, Sītā, and serve my parents. The forest is full of wild beasts, thorns, storms and rākṣasas, and it is no place for a princess.” Sītā’s eyes filled with tears, but her voice was firm. “My lord, a wife’s place is beside her husband. Where you are, there is Ayodhyā; without you, even the palace is a forest.”",
          "“In the forest I will walk before you and clear the thorns from your path,” she said. “The bare earth with you will be softer to me than silken beds without you. If you leave me behind, I will give up my life.” Rāma could not refuse her love, and he said, “Then come, Sītā, and share my forest life.”"
        ],
        "place": "ayodhya"
      },
      {
        "title": "Lakṣmaṇa and Ūrmilā",
        "dev": "लक्ष्मण और ऊर्मिला",
        "chars": [
          "lakshmana",
          "rama",
          "sumitra",
          "urmila"
        ],
        "text": [
          "Lakṣmaṇa fell at Rāma’s feet. “I will not stay behind, brother. I will go before you with my bow, I will gather fruits and roots for you, and I will guard you while you sleep.” Rāma embraced him, and Lakṣmaṇa went to take leave of his mother. Queen Sumitrā held her son’s face and gave him a blessing that is still remembered today. “Look upon Rāma as your father, upon Sītā as your mother, and upon the forest as Ayodhyā. Go, my son, and serve them well.”",
          "Then Lakṣmaṇa went to his wife Ūrmilā. She longed to go with him, but she knew that her presence would keep him from his service. With quiet tears she said, “Go, my lord, and serve your brother without a single thought of me.” It is said that for fourteen years Lakṣmaṇa never slept, so that he could guard Rāma and Sītā night and day, and that Ūrmilā took his sleep upon herself, waiting in silence for his return."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Bark Garments",
        "dev": "वल्कल धारण",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "dasharatha",
          "kaikeyi",
          "vasishtha"
        ],
        "text": [
          "Kaikeyī brought garments of tree bark for the exiles. Rāma and Lakṣmaṇa laid aside their silks and jewels and dressed as forest hermits, binding their hair into matted locks. When Sītā took the bark garment in her hands, not knowing how to wear it, the whole court wept, and even Vasiṣṭha rebuked Kaikeyī.",
          "Rāma bowed before his father for the last time. Daśaratha clung to him and wept, “Rāma, Rāma!” Then Rāma, Sītā and Lakṣmaṇa climbed into the chariot of Sumantra and set out from the city of their birth."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Weeping City",
        "dev": "शोकाकुल अयोध्या",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "sumantra"
        ],
        "text": [
          "The whole of Ayodhyā ran after the chariot, weeping and calling out Rāma’s name, and the old king stumbled behind it in the dust until he could see it no more. Elephants and horses wept, birds fell silent in the trees, and no fires were lit in the homes of Ayodhyā that night.",
          "That night, on the banks of the Tamasā, the citizens who had followed Rāma lay down to sleep, resolved to live with him in the forest. Before dawn, Rāma gently woke Sumantra, and they drove on quietly so that the people could return to their homes. When the citizens awoke and found him gone, they returned to Ayodhyā, grieving, as if every home had lost a son."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Guha and the Boatman",
        "dev": "केवट प्रसंग",
        "chars": [
          "guha",
          "rama",
          "sita",
          "lakshmana"
        ],
        "text": [
          "At Śṛṅgaverapura on the banks of the Gaṅgā, Guha, the king of the forest people and Rāma’s dear friend, came running to embrace him and offered his whole kingdom. Rāma lovingly refused, for he had vowed to live as a hermit. That night Rāma and Sītā slept on a bed of grass beneath a tree, while Lakṣmaṇa and Guha kept watch until dawn.",
          "In the morning Rāma asked a humble boatman to take them across the Gaṅgā. The boatman folded his hands and smiled. “Lord, I have heard that the dust of your feet turned a stone into a woman. My wooden boat is all I have; first let me wash your feet.” Rāma laughed gently and allowed him. With tears of joy the boatman washed the Lord’s feet in a wooden bowl, sprinkled the water upon his family, and rowed them across the river.",
          "Sītā took off her ring to give him as his fare, but the boatman bowed and refused. “Lord, today I have received everything. When you return from the forest, give me whatever you wish.”"
        ],
        "place": "shringaverapura"
      },
      {
        "title": "Bharadvāja and Citrakūṭa",
        "dev": "चित्रकूट",
        "chars": [
          "bharadwaja",
          "rama",
          "sita",
          "lakshmana"
        ],
        "text": [
          "At Prayāga, where the Gaṅgā meets the Yamunā, the sage Bharadvāja welcomed the three exiles and advised them to live on the hill of Citrakūṭa, a holy place of streams, flowers and peacocks. There Lakṣmaṇa built a hut of leaves and bamboo beside the Mandākinī river, and Rāma blessed it with prayers.",
          "Life in Citrakūṭa was peaceful and pure. Rāma showed Sītā the colourful rocks of the mountain and the lotuses on the river, and Sītā said that she was happier there than she had ever been in the palace."
        ],
        "place": "chitrakoot"
      },
      {
        "title": "The Death of Daśaratha",
        "dev": "दशरथ का स्वर्गवास",
        "chars": [
          "dasharatha",
          "kausalya",
          "sumantra"
        ],
        "text": [
          "When Sumantra returned alone with the empty chariot, the king fainted with grief. That night, in Kausalyā’s chamber, he told her of the sin of his youth. “Long ago, hunting by the Sarayū at night, I heard a sound like an elephant drinking and loosed an arrow toward it. It was a young man, Śravaṇa Kumāra, filling his pitcher for his blind and aged parents.”",
          "“Dying, he begged me to take the water to them,” the king went on. “When they learned that their only son was dead, his father cursed me: ‘You too shall die grieving for your son.’ Now that curse has come true.” Calling out the name of Rāma again and again, King Daśaratha breathed his last, and the whole palace was plunged into mourning."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Bharata Returns",
        "dev": "भरत आगमन",
        "chars": [
          "bharata",
          "kaikeyi",
          "kausalya",
          "shatrughna",
          "manthara"
        ],
        "text": [
          "Messengers rode swiftly to Kekaya, and Bharata hurried home, troubled by dark dreams. He found Ayodhyā silent and the palace dark. Kaikeyī greeted him with a smile. “Your father has gone to heaven, my son, and I have won the kingdom for you; Rāma has been sent to the forest.”",
          "Bharata cried out as if struck by a spear. “Mother, what have you done? You have killed my father and banished my brother, who is dearer to me than life!” He turned from her in grief and ran to Kausalyā’s chambers. Falling at her feet, he swore that he had known nothing of the plot. When Śatrughna seized Mantharā in anger, Bharata held him back, for Rāma would never forgive harm done to a woman."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Bharata’s Vow",
        "dev": "भरत की प्रतिज्ञा",
        "chars": [
          "bharata",
          "vasishtha",
          "shatrughna"
        ],
        "text": [
          "Bharata performed his father’s funeral rites beside the Sarayū with a breaking heart. When Vasiṣṭha and the ministers begged him to take the throne, he refused. “The kingdom belongs to Rāma, and I belong to him. I will go to the forest and bring him back, and if he will not return, I will live there with him as Lakṣmaṇa does.”",
          "The whole of Ayodhyā set out with Bharata: the queens, the priests, the army and the people, all longing to see their beloved Rāma again."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Bharata Meets Rāma",
        "dev": "भरत मिलाप",
        "chars": [
          "bharata",
          "rama",
          "lakshmana",
          "sita",
          "shatrughna",
          "vasishtha",
          "kausalya"
        ],
        "text": [
          "When Lakṣmaṇa saw a great army approaching Citrakūṭa, he climbed a tree and cried, “Bharata comes to destroy us, brother!” Rāma smiled. “Bharata could never harm us, Lakṣmaṇa; he comes out of love.”",
          "Bharata saw Rāma seated in his hut of leaves, his hair matted and his body clothed in bark, and he ran forward and fell at his feet, weeping, “Brother!” Rāma lifted him up and held him to his heart, and those who saw it said that even the trees and rocks of Citrakūṭa wept.",
          "Then Bharata told Rāma that their father was gone. Rāma fell to the ground in grief. In the cold waters of the Mandākinī he offered water to the departed king, and the three queens embraced their sons in tears."
        ],
        "place": "chitrakoot"
      },
      {
        "title": "The Sandals of the Lord",
        "dev": "राम पादुका",
        "chars": [
          "bharata",
          "rama",
          "vasishtha"
        ],
        "text": [
          "For days Bharata begged Rāma to return and rule. Rāma answered with gentle firmness: “Our father’s word must be kept, Bharata. You will rule Ayodhyā, and I will live in the forest for fourteen years. Only then will I return.”",
          "At last Bharata held out a pair of golden sandals. “Then place your feet upon these, brother. These sandals will rule Ayodhyā in your name, and I will be their servant. If you do not return on the very day the fourteen years end, I will enter the fire.” Rāma stepped into the sandals and gave them back, and Bharata placed them on his own head and carried them home with tears of devotion."
        ],
        "place": "chitrakoot"
      },
      {
        "title": "Nandigrāma",
        "dev": "नन्दिग्राम",
        "chars": [
          "bharata",
          "shatrughna"
        ],
        "text": [
          "Bharata would not enter Ayodhyā while his brother lived in the forest. In the village of Nandigrāma he placed Rāma’s sandals upon the royal throne and sat beneath them, dressed in bark, his hair matted like a hermit’s. For fourteen years he slept on the bare ground, ate only roots and fruits, and ruled the kingdom as the humble servant of his brother’s sandals."
        ],
        "place": "nandigram"
      },
      {
        "title": "Atri and Anasūyā",
        "dev": "अत्रि और अनसूया",
        "chars": [
          "atri",
          "anasuya",
          "sita",
          "rama",
          "lakshmana"
        ],
        "text": [
          "Rāma left Citrakūṭa, for its memories of his family were too dear, and travelled south to the hermitage of the sage Atri and his wife Anasūyā, renowned for her purity. Anasūyā embraced Sītā like a mother and spoke to her of a wife’s devotion and of the power of a pure heart.",
          "Pleased with Sītā’s gentleness, Anasūyā gave her divine garments, garlands and ornaments that would never fade nor tarnish. Then, blessed by the holy couple, the three exiles entered the great Daṇḍaka forest."
        ],
        "place": "chitrakoot"
      }
    ]
  },
  {
    "id": "aranya",
    "num": 3,
    "name": "Araṇya Kāṇḍa",
    "dev": "अरण्यकाण्ड",
    "subtitle": "The Book of the Forest",
    "accent": "#7bd389",
    "summary": "Rāma protects the sages of the Daṇḍaka forest and settles at Pañcavaṭī. Śūrpaṇakhā’s anger brings Rāvaṇa’s plot: the golden deer, the Lakṣmaṇa-rekhā, and the false mendicant who carries Sītā away in the Puṣpaka vimāna without ever daring to touch her. Jaṭāyu gives his life for her, and the grieving Rāma is blessed by the devotion of Śabarī.",
    "episodes": [
      {
        "title": "Into the Daṇḍaka",
        "dev": "दण्डकारण्य प्रवेश",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "viradha"
        ],
        "text": [
          "The Daṇḍaka forest was vast and deep, filled with hermitages where sages lived in prayer, and with dark places where rākṣasas roamed. The sages came out to welcome Rāma with fruits and flowers, rejoicing that their protector had come.",
          "Soon a monstrous rākṣasa named Virādha burst out of the trees, roaring like thunder and brandishing a spear, and blocked the path before Sītā. Rāma and Lakṣmaṇa sprang between them, and their arrows flew like lightning. By a boon no weapon could slay Virādha, so the brothers overpowered him with their bare hands and buried him in the earth. As he died, the curse upon him was lifted, and a shining gandharva rose from the ground and blessed Rāma."
        ],
        "place": "dandaka"
      },
      {
        "title": "The Sages’ Plea",
        "dev": "ऋषियों की प्रार्थना",
        "chars": [
          "rama",
          "lakshmana",
          "sita"
        ],
        "text": [
          "The sages of the Daṇḍaka led Rāma to a hill of white bones, the remains of holy men slain by the rākṣasas. “O Rāma, you are our king and our protector,” they pleaded. “Save us from these demons.” Rāma’s eyes filled with tears, and he raised his bow. “I vow to free this forest from fear.”",
          "For ten years the three exiles wandered from hermitage to hermitage, living among the sages, sharing their prayers and protecting their sacred fires. Wherever Rāma went, the forest grew peaceful again."
        ],
        "place": "dandaka"
      },
      {
        "title": "Agastya’s Blessing",
        "dev": "अगस्त्य मुनि",
        "chars": [
          "agastya",
          "rama",
          "sita",
          "lakshmana"
        ],
        "text": [
          "At last they came to the hermitage of the great sage Agastya, who had once humbled the Vindhya mountains and drunk up the ocean. Agastya embraced Rāma as one embraces the Lord Himself, and gave him gifts made by the gods: the great bow of Viṣṇu, a quiver that would never be empty, and a sword set with gold.",
          "“Go to Pañcavaṭī by the river Godāvarī,” said the sage. “It is a beautiful place, rich in fruits and flowers, and there you shall dwell until your destiny calls.”"
        ],
        "place": "agastya"
      },
      {
        "title": "Jaṭāyu and Pañcavaṭī",
        "dev": "पञ्चवटी",
        "chars": [
          "jatayu",
          "rama",
          "sita",
          "lakshmana"
        ],
        "text": [
          "On the way they met a great old vulture sitting on a tree, and Lakṣmaṇa raised his bow, thinking him a demon. “I am Jaṭāyu, a friend of your father Daśaratha,” said the bird. “While you go out into the forest, I will watch over Sītā.” Rāma bowed to him with joy and love.",
          "At Pañcavaṭī, where five great banyan trees grew beside the Godāvarī, Lakṣmaṇa built a beautiful hut of leaves. There Rāma, Sītā and Lakṣmaṇa lived in peace through the seasons, bathing in the river at dawn and praying at dusk, while the deer grazed fearlessly around their home."
        ],
        "place": "panchavati"
      },
      {
        "title": "Śūrpaṇakhā",
        "dev": "शूर्पणखा",
        "chars": [
          "shurpanakha",
          "rama",
          "lakshmana",
          "sita"
        ],
        "text": [
          "One day Śūrpaṇakhā, the sister of Rāvaṇa, wandered into Pañcavaṭī and saw Rāma. Taking on the form of a beautiful woman, she came before him and demanded that he make her his wife. Rāma replied gently, “I am married, and my wife is with me. Go to my brother.” But Lakṣmaṇa too refused her, for he served only Rāma and Sītā.",
          "Mad with rage, Śūrpaṇakhā threw off her disguise and rushed at Sītā with claws outstretched, to devour her. In a flash Lakṣmaṇa stepped forward with his sword and cut off her nose and ears. Howling with pain and shame, she fled through the forest to her brother Khara."
        ],
        "place": "panchavati"
      },
      {
        "title": "Khara and Dūṣaṇa",
        "dev": "खर-दूषण वध",
        "chars": [
          "khara",
          "dushana",
          "rama",
          "lakshmana",
          "sita"
        ],
        "text": [
          "Khara sent fourteen of his fiercest warriors, and Rāma struck them all down with fourteen arrows. Then Khara and Dūṣaṇa came themselves with an army of fourteen thousand rākṣasas, darkening the sky like a storm.",
          "Rāma sent Lakṣmaṇa to guard Sītā in a mountain cave, and faced the whole army alone. Standing like a mountain, he drew his bow, and his arrows poured like rain into the storm of demons. In less than two hours the fourteen thousand lay still, Dūṣaṇa had fallen, and at last Khara himself was slain. The sages of the forest showered flowers upon Rāma, and Sītā came out of the cave and looked upon her lord with joy."
        ],
        "place": "panchavati"
      },
      {
        "title": "Śūrpaṇakhā in Laṅkā",
        "dev": "शूर्पणखा लंका में",
        "chars": [
          "shurpanakha",
          "ravana"
        ],
        "text": [
          "Śūrpaṇakhā fled across the sea to Laṅkā and threw herself before Rāvaṇa in his golden court. “You sit here among your pleasures while your kingdom falls! A man named Rāma has slain Khara, Dūṣaṇa and fourteen thousand of our warriors, and his brother has disfigured your own sister.”",
          "Then, to stir his pride, she spoke of Sītā’s radiant beauty and virtue. “Bring her to Laṅkā, brother, and avenge me.” Rāvaṇa’s ten faces darkened, and he resolved to carry Sītā away."
        ],
        "place": "lanka"
      },
      {
        "title": "Rāvaṇa and Mārīca",
        "dev": "रावण-मारीच संवाद",
        "chars": [
          "ravana",
          "mareecha"
        ],
        "text": [
          "Rāvaṇa flew in his Puṣpaka vimāna to the hermitage of Mārīca, who now lived as a hermit by the sea. “Take the form of a golden deer,” he commanded, “and lure Rāma and Lakṣmaṇa away from Sītā.”",
          "Mārīca trembled at the very name of Rāma. “I have felt his arrows, Rāvaṇa. Do not do this, or you will destroy yourself, your family and all of Laṅkā.” Rāvaṇa drew his sword. “Obey me, or die by my hand.” Mārīca sighed. “Death at the hands of Rāma is better than death at yours.” And he went."
        ]
      },
      {
        "title": "The Golden Deer",
        "dev": "स्वर्ण मृग",
        "chars": [
          "mareecha",
          "sita",
          "rama",
          "lakshmana"
        ],
        "text": [
          "The next morning, as Sītā gathered flowers, a wondrous deer appeared before the hut, its body shining like gold, its skin studded with silver spots like stars, its antlers glittering with jewels. Sītā was enchanted. “My lord, please bring me that deer.” Lakṣmaṇa warned, “Brother, no such deer exists in nature; it must be a rākṣasa’s trick.” But Rāma, to please Sītā, took up his bow. “Guard Sītā, Lakṣmaṇa, and do not leave her for a moment.”",
          "The deer led Rāma deep into the forest, leaping, vanishing and appearing again, until at last Rāma loosed an arrow. As Mārīca fell, he took his own form and cried out in Rāma’s very voice, “Hā Sītā! Hā Lakṣmaṇa!” Rāma knew at once that it was a trap, and he turned and hurried back toward Pañcavaṭī."
        ],
        "place": "panchavati"
      },
      {
        "title": "The Lakṣmaṇa-Rekhā",
        "dev": "लक्ष्मण रेखा",
        "chars": [
          "sita",
          "lakshmana"
        ],
        "text": [
          "Hearing the cry, Sītā turned pale with terror. “Go, Lakṣmaṇa! Your brother is in danger!” Lakṣmaṇa answered calmly, “Mother, no one in the three worlds can harm Rāma; this voice is a demon’s trick.” But in her fear for Rāma, Sītā spoke harsh and wounding words, and Lakṣmaṇa’s heart was pierced.",
          "With folded hands Lakṣmaṇa said, “Your words are like burning arrows to me, Mother, but I will obey.” Before leaving, he drew a line upon the earth around the hut with the tip of his arrow. “Do not step beyond this line, Mother, whatever happens. No one who crosses it can harm you.” He called on the gods of the forest to protect her, and left with a heavy heart."
        ],
        "place": "panchavati"
      },
      {
        "title": "The Mendicant at the Door",
        "dev": "साधु वेश में रावण",
        "chars": [
          "ravana",
          "sita"
        ],
        "text": [
          "The moment Lakṣmaṇa was gone, Rāvaṇa appeared in the guise of a wandering mendicant, in saffron robes with a staff and a water pot. The trees stopped swaying, the wind fell silent, and even the river Godāvarī slowed her flow in fear.",
          "He stood outside the line and called, “Bhikṣām dehi! Give alms, O lady.” Sītā brought fruits and water to the edge of the line, but he would not come nearer. “A holy man does not take alms from one who stands behind a barrier. Come out, or I will leave unfed and the sin will be yours.” Bound by the sacred duty of honouring a guest, Sītā stepped across the line."
        ],
        "place": "panchavati"
      },
      {
        "title": "The Abduction of Sītā",
        "dev": "सीता हरण",
        "chars": [
          "ravana",
          "sita"
        ],
        "text": [
          "At once the mendicant vanished, and Rāvaṇa stood before her in his own terrible form, with ten crowned heads and eyes burning like coals. “I am Rāvaṇa, king of Laṅkā. Come and be my queen.” Sītā stood unafraid, blazing with purity. “You are a jackal who desires a lioness! My lord Rāma will destroy you as fire destroys dry grass.”",
          "Rāvaṇa did not dare to touch her, for an old curse would shatter his heads if he forced himself upon any woman. With his terrible strength he tore up the very ground on which Sītā stood, and lifted it with her into the golden Puṣpaka vimāna. The vimāna rose into the sky, and Sītā stood alone upon that patch of earth, weeping and crying out, “Rāma! Lakṣmaṇa! Save me!” She called to the trees, the river and the deer below to tell Rāma what had become of her."
        ],
        "place": "panchavati"
      },
      {
        "title": "Jaṭāyu’s Last Battle",
        "dev": "जटायु युद्ध",
        "chars": [
          "jatayu",
          "ravana",
          "sita"
        ],
        "text": [
          "The old vulture Jaṭāyu, resting on a high tree, heard Sītā’s cries and flew up to block the vimāna’s path. “Rāvaṇa, release the wife of Rāma! I am old and unarmed, but while I live you shall not take her.” With his mighty wings and talons he fell upon Rāvaṇa, shattered his bow and tore away his armour.",
          "The battle raged across the sky until the old bird grew weary. Then Rāvaṇa drew his sword Candrahāsa and cut off Jaṭāyu’s wings. The noble bird fell to the earth, still crying out the name of Rāma."
        ],
        "place": "jatayu-fall"
      },
      {
        "title": "The Ornaments and the Aśoka Grove",
        "dev": "आभूषण और अशोक वाटिका",
        "chars": [
          "sita",
          "ravana",
          "trijata"
        ],
        "text": [
          "As the vimāna flew over a mountain, Sītā saw five vānaras sitting on a peak below. She quickly tied her ornaments into her upper cloth and let the bundle fall, praying that it would reach Rāma.",
          "Rāvaṇa brought her across the ocean to Laṅkā and showed her all its golden splendour, but Sītā would not even look at it. He kept her in the Aśoka grove, guarded by fearsome rākṣasīs. There, beneath a śiṃśapā tree, Sītā sat upon the bare ground, thin with grief, her eyes fixed on the earth, repeating the name of Rāma."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "Rāma’s Grief",
        "dev": "राम विलाप",
        "chars": [
          "rama",
          "lakshmana"
        ],
        "text": [
          "On the forest path Rāma met Lakṣmaṇa, and his heart sank. “Why have you left Sītā alone?” They ran to the hut and found it empty, the flowers scattered and the line upon the earth broken.",
          "Rāma searched every grove and stream, calling her name. “O trees, have you seen my Sītā? O Godāvarī, where is she?” The deer looked toward the south, as if to show the way. Then, overcome with grief and anger, Rāma raised his bow against the whole world, until Lakṣmaṇa held his hand and gently calmed him."
        ],
        "place": "panchavati"
      },
      {
        "title": "Jaṭāyu’s Liberation",
        "dev": "जटायु मोक्ष",
        "chars": [
          "jatayu",
          "rama",
          "lakshmana"
        ],
        "text": [
          "Following the south, they found Jaṭāyu lying in his own blood, his wings cut away. With his last breath he told them, “Rāvaṇa has taken Sītā toward the south. I fought for her, Rāma, but I am old.” Rāma took the dying bird’s head upon his lap and wept as if for his own father.",
          "Jaṭāyu breathed his last in Rāma’s arms. With his own hands Rāma built a funeral pyre and performed the last rites for him as a son does for a father, and Jaṭāyu rose to the highest heaven, blessed by the Lord he had served."
        ],
        "place": "jatayu-fall"
      },
      {
        "title": "Kabandha",
        "dev": "कबन्ध उद्धार",
        "chars": [
          "kabandha",
          "rama",
          "lakshmana"
        ],
        "text": [
          "In a dark forest the brothers were seized by Kabandha, a headless giant with a single eye in his chest, a mouth in his belly and enormous arms. Rāma and Lakṣmaṇa cut off his arms with their swords, and the giant fell. As Rāma cremated him, a shining celestial being rose from the flames, freed from an ancient curse.",
          "“Go to Lake Pampā,” he said. “Seek the friendship of Sugrīva, the exiled king of the vānaras, who lives on the mountain Ṛṣyamūka. He will help you find Sītā. And on your way, visit the holy Śabarī, who has waited all her life for you.”"
        ],
        "place": "kabandha"
      },
      {
        "title": "Śabarī’s Berries",
        "dev": "शबरी के बेर",
        "chars": [
          "shabari",
          "rama",
          "lakshmana"
        ],
        "text": [
          "Near Lake Pampā lived Śabarī, an old woman of the forest tribe, who had served her guru Mataṅga all her life. Before he left this world, he had told her, “Wait here, Śabarī; one day the Lord Himself will come to your door.” Every day for years she swept the path, scattered flowers upon it, and gathered sweet berries from the forest. She tasted each berry first, so that only the sweetest would be offered to her Lord.",
          "When at last Rāma came, Śabarī fell at his feet, weeping with joy, and offered him her basket of tasted berries. Rāma ate them with great love, saying that he had never tasted anything so sweet, for they were sweetened by devotion. Then, with Rāma’s blessing, Śabarī entered the sacred fire and rose to the heavens in a body of light."
        ],
        "place": "pampa"
      }
    ]
  },
  {
    "id": "kishkindha",
    "num": 4,
    "name": "Kiṣkindhā Kāṇḍa",
    "dev": "किष्किन्धाकाण्ड",
    "subtitle": "The Book of the Vānara Kingdom",
    "accent": "#e6b85c",
    "summary": "Hanumān meets Rāma and becomes his servant for all time. Rāma makes a pact of friendship with the exiled Sugrīva before the sacred fire, slays Vālī, and restores Sugrīva to his throne. After the monsoon the vānara armies search the four corners of the earth, and on the southern shore Jāmbavān reminds Hanumān of his forgotten strength.",
    "episodes": [
      {
        "title": "Hanumān Meets Rāma",
        "dev": "राम-हनुमान मिलन",
        "chars": [
          "hanuman",
          "rama",
          "lakshmana",
          "sugriva"
        ],
        "text": [
          "On the mountain Ṛṣyamūka, Sugrīva, the exiled king of the vānaras, saw two mighty archers walking beside Lake Pampā and feared that his brother Vālī had sent them to kill him. He sent his wisest minister, Hanumān, son of the Wind, to discover who they were.",
          "Hanumān took the form of a young brāhmaṇa and came before the brothers with folded hands. He spoke so gracefully, with such learning and such humility, that Rāma turned to Lakṣmaṇa in wonder. “No one could speak like this without mastering all the Vedas.” When Rāma told him their names, Hanumān’s heart overflowed. He took his true form, fell at the Lord’s feet, and lifted both brothers onto his shoulders to carry them up the mountain to Sugrīva."
        ],
        "place": "rishyamuka"
      },
      {
        "title": "Friendship Before the Fire",
        "dev": "अग्नि साक्षी मैत्री",
        "chars": [
          "rama",
          "sugriva",
          "hanuman",
          "lakshmana"
        ],
        "text": [
          "Before a sacred fire kindled by Hanumān, Rāma and Sugrīva joined hands and walked around the flames, vowing lifelong friendship. “Your joys and sorrows are now mine,” said Rāma. Sugrīva promised, “I will help you find Sītā, wherever she may be.”",
          "Then Sugrīva brought the bundle of ornaments that a weeping lady had dropped from a flying vimāna. Rāma pressed them to his heart and wept. “Lakṣmaṇa, do you know these?” Lakṣmaṇa looked and said, “I do not know her bracelets or her earrings, brother, for I never raised my eyes to her face. But these anklets I know well, for every day I bowed at her feet.”"
        ],
        "place": "rishyamuka"
      },
      {
        "title": "The Feud of Vālī and Sugrīva",
        "dev": "बाली और सुग्रीव",
        "chars": [
          "vali",
          "sugriva",
          "rama"
        ],
        "text": [
          "Sugrīva told his story. His elder brother Vālī, the mighty king of Kiṣkindhā, had once chased a demon into a deep cave and told Sugrīva to wait at its mouth. After a year, blood flowed out of the cave, and Sugrīva, believing his brother dead, sealed the cave with a boulder and returned to the city, where the vānaras made him king.",
          "But Vālī returned alive, and believing that Sugrīva had betrayed him, he drove his brother out of the kingdom and took away his wife Rumā. Since then Sugrīva had lived in fear on Ṛṣyamūka, the one place Vālī could not enter because of a sage’s curse."
        ],
        "place": "kishkindha"
      },
      {
        "title": "The Seven Sāla Trees",
        "dev": "सप्त ताल भेदन",
        "chars": [
          "rama",
          "sugriva",
          "lakshmana"
        ],
        "text": [
          "To show Sugrīva the strength of his friend, Rāma kicked the enormous dried skeleton of the demon Dundubhi so far that it flew beyond the horizon. Then he drew his bow and loosed a single arrow that pierced seven great sāla trees standing in a row, passed through the mountain behind them, and returned to his quiver. Sugrīva fell at Rāma’s feet, his doubts gone forever."
        ],
        "place": "rishyamuka"
      },
      {
        "title": "The Fall of Vālī",
        "dev": "बाली वध",
        "chars": [
          "vali",
          "sugriva",
          "rama",
          "tara"
        ],
        "text": [
          "Sugrīva went to the gates of Kiṣkindhā and roared a challenge, and Vālī rushed out, blazing like the sun. But the two brothers looked so alike that Rāma could not tell them apart, and he held back his arrow while Sugrīva was beaten. Rāma placed a garland of flowers around Sugrīva’s neck so that he would know him, and sent him back to fight again.",
          "Tārā, Vālī’s wise queen, begged her husband not to go. “Sugrīva would not return so soon unless a mighty protector stands with him.” But Vālī would not listen. The brothers fought like two mountains crashing together, and as Vālī raised his arm for the final blow, Rāma loosed his arrow from behind a tree, and Vālī fell."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Vālī’s Question, Rāma’s Answer",
        "dev": "बाली-राम संवाद",
        "chars": [
          "vali",
          "rama",
          "sugriva",
          "angada"
        ],
        "text": [
          "Dying, Vālī looked up at Rāma and spoke bitterly. “You are called the protector of dharma, yet you struck me from hiding while I fought another. Is this righteousness?” Rāma answered calmly, “You took your younger brother’s wife while he lived, which is a grave sin against dharma. As a king of the line of Ikṣvāku, ruler of this earth, I have punished you as the law commands.”",
          "Vālī’s anger melted, and he folded his hands. “Forgive me, Lord. Protect my son Aṅgada.” He gave Sugrīva his golden necklace and asked him to care for Aṅgada as his own son. Then, gazing at Rāma, Vālī breathed his last with the Lord’s name on his lips."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Tārā’s Lament",
        "dev": "तारा विलाप",
        "chars": [
          "tara",
          "angada",
          "sugriva",
          "vali"
        ],
        "text": [
          "Tārā ran to the battlefield and fell weeping beside her husband, and young Aṅgada bowed his head in grief. Even Sugrīva wept bitterly for the brother he had once loved. Rāma comforted them with gentle words about the nature of life and death, and Vālī’s funeral was performed with royal honours beside the river."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Sugrīva Crowned",
        "dev": "सुग्रीव का राज्याभिषेक",
        "chars": [
          "sugriva",
          "angada",
          "rama",
          "lakshmana",
          "hanuman"
        ],
        "text": [
          "Sugrīva was crowned king of Kiṣkindhā and Aṅgada was made the crown prince. But the monsoon had come, and no army could march in the rains. Rāma and Lakṣmaṇa waited on the mountain Prasravaṇa, in a cave among dripping trees.",
          "Through the long months of rain, Rāma gazed at the dark clouds and the lightning, and longed for Sītā. Every peacock’s cry reminded him of her, and Lakṣmaṇa comforted him through the long nights, saying that soon the rains would end and the search would begin."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Lakṣmaṇa’s Wrath",
        "dev": "लक्ष्मण का क्रोध",
        "chars": [
          "lakshmana",
          "sugriva",
          "tara",
          "hanuman"
        ],
        "text": [
          "The rains ended, the skies cleared and autumn came, but Sugrīva, lost in the comforts of his palace, forgot his promise. Lakṣmaṇa strode to Kiṣkindhā with his bow drawn, and the vānara guards fled before his fury.",
          "Wise Tārā came out to meet him with gentle words. “Forgive him, prince. Sugrīva has not forgotten Rāma; even now the vānara armies are gathering.” Ashamed, Sugrīva fell at Lakṣmaṇa’s feet, and together they went to Rāma, followed by vānara hosts from every mountain and forest of the earth."
        ],
        "place": "kishkindha"
      },
      {
        "title": "The Great Search",
        "dev": "सीता की खोज",
        "chars": [
          "sugriva",
          "hanuman",
          "rama",
          "angada",
          "jambavan"
        ],
        "text": [
          "Sugrīva divided the countless vānaras into four armies and sent them to the four corners of the earth, with orders to return within a month. To the south, the most dangerous direction, he sent his finest heroes: Aṅgada, Hanumān, Jāmbavān the wise king of the bears, and the generals Nala and Nīla.",
          "Rāma took Hanumān aside and placed his own ring in his hand, engraved with the name of Rāma. “Hanumān, I have faith that you will find her. Show her this ring, so that she will know you come from me.” Hanumān pressed the ring to his head, bowed at Rāma’s feet, and set out toward the south."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Svayamprabhā’s Cave",
        "dev": "स्वयंप्रभा की गुफा",
        "chars": [
          "hanuman",
          "angada",
          "jambavan"
        ],
        "text": [
          "Searching the southern lands, the vānaras grew faint with hunger and thirst, until they found a deep cave from which water birds flew out. Inside lay a wondrous golden city with trees of jewels and lakes of clear water, where the holy ascetic Svayamprabhā lived in prayer. She fed them, and by her power she carried them out of the cave in the blink of an eye to the shore of the southern ocean."
        ]
      },
      {
        "title": "Despair on the Shore and Sampāti",
        "dev": "सम्पाती",
        "chars": [
          "angada",
          "hanuman",
          "jambavan",
          "sampati"
        ],
        "text": [
          "The month had passed, and Sītā had not been found. On the shore of the endless ocean, Aṅgada and the vānaras sat down to fast unto death rather than return in failure. Speaking of their sorrow, they recalled the noble Jaṭāyu, who had died fighting for Sītā.",
          "Hearing that name, an ancient wingless vulture crept out of a cave. It was Sampāti, Jaṭāyu’s elder brother, whose wings had been burned by the sun long ago when he flew up to shield his brother. Weeping for Jaṭāyu, he said, “My eyes can see a hundred yojanas. Across this ocean lies Laṅkā, and there, in the Aśoka grove, sits Sītā, surrounded by rākṣasīs.” As he spoke, new wings sprouted from his body, and he soared joyfully into the sky."
        ],
        "place": "mahendra"
      },
      {
        "title": "Jāmbavān Awakens Hanumān",
        "dev": "जाम्बवान का स्मरण",
        "chars": [
          "jambavan",
          "hanuman",
          "angada"
        ],
        "text": [
          "But who could leap a hundred yojanas across the ocean? One by one the vānaras spoke of their strength, and none could do it. Hanumān sat apart in silence, for as a child a sage’s curse had made him forget his own powers until someone reminded him.",
          "Then old Jāmbavān went to Hanumān. “Why are you silent, son of the Wind? As a baby you leapt to the sky to seize the sun, thinking it a ripe fruit. Your strength is equal to the wind itself; you were born to serve Rāma. Rise, Hanumān!”",
          "As Jāmbavān spoke, Hanumān remembered who he was. He began to grow, larger and larger, until he stood like a golden mountain shining in the sun. “I will leap across the ocean, find Sītā, and return,” he roared, and he climbed the great Mount Mahendra, chanting the name of Rāma."
        ],
        "place": "mahendra"
      }
    ]
  },
  {
    "id": "sundara",
    "num": 5,
    "name": "Sundara Kāṇḍa",
    "dev": "सुन्दरकाण्ड",
    "subtitle": "The Beautiful Book",
    "accent": "#ffcf5a",
    "summary": "The book of Hanumān. Chanting Rāma’s name, he leaps across the ocean, overcomes three ordeals, searches Laṅkā by moonlight and finds Sītā in the Aśoka grove, where she holds a blade of grass between herself and Rāvaṇa. He gives her Rāma’s ring, sets Laṅkā ablaze with his burning tail, and returns with the words that bring Rāma back to life: “I have seen Sītā.”",
    "episodes": [
      {
        "title": "The Great Leap",
        "dev": "हनुमान की छलांग",
        "chars": [
          "hanuman",
          "jambavan",
          "angada"
        ],
        "text": [
          "Standing on the summit of Mount Mahendra, Hanumān bowed to the Sun, to Indra, to Brahmā and to his father the Wind, and fixed his mind on Rāma. He pressed down on the mountain with his feet until streams of water burst from its rocks, and with a mighty roar of “Jai Śrī Rām!” he sprang into the sky.",
          "He flew over the ocean like an arrow loosed from Rāma’s bow, his shadow racing across the waves, the wind roaring in his wake. The vānaras on the shore cheered until he was a golden speck on the horizon."
        ],
        "place": "mahendra"
      },
      {
        "title": "Maināka, Surasā and Siṃhikā",
        "dev": "मैनाक, सुरसा और सिंहिका",
        "chars": [
          "hanuman"
        ],
        "text": [
          "Midway across the ocean, the golden mountain Maināka rose from the waves and offered him rest. Hanumān touched it gratefully with his hand. “I cannot rest until my work for Rāma is done,” he said, and flew on.",
          "Then Surasā, the mother of serpents, rose before him with her mouth wide open, sent by the gods to test him. “No one may pass me without entering my mouth.” Hanumān grew larger, and she opened her mouth wider still; then in a flash he became as small as a thumb, darted into her mouth and out again, and bowed to her. Surasā blessed him with a smile. “Go, wise one, and may you succeed in Rāma’s work.”",
          "Last came Siṃhikā, a monstrous shadow-demoness who seized Hanumān by his shadow on the waves and dragged him toward her jaws. Hanumān let her swallow him, then tore his way out, and she sank lifeless into the sea."
        ],
        "place": "rameswaram"
      },
      {
        "title": "Laṅkinī at the Gate",
        "dev": "लंकिनी",
        "chars": [
          "hanuman",
          "lankini"
        ],
        "text": [
          "At dusk Hanumān landed on Mount Trikūṭa and gazed in wonder at Laṅkā, a city of gold upon the mountaintop, with walls of gold, towers of crystal and gates studded with jewels. As night fell, he made himself as small as a cat and crept toward the gate.",
          "The guardian goddess of the city, Laṅkinī, blocked his way with a terrible cry. Hanumān struck her with his left fist, and she fell to the ground. Rising, she folded her hands. “Brahmā once told me that when a vānara strikes me down, the end of Laṅkā has come. Enter, messenger of Rāma, and may your work succeed.”"
        ],
        "place": "lanka"
      },
      {
        "title": "Searching Laṅkā by Moonlight",
        "dev": "लंका में खोज",
        "chars": [
          "hanuman"
        ],
        "text": [
          "Under the silver moon Hanumān leapt from roof to roof across the sleeping city, searching every mansion and garden. He saw the splendid palace of Rāvaṇa, and the Puṣpaka vimāna glowing like a jewel in its courtyard, but nowhere could he find Sītā.",
          "In one palace he saw a queen of great beauty sleeping on a golden couch, and for a moment his heart leapt, thinking she was Sītā. Then he shook his head. “Sītā, parted from Rāma, would never sleep in comfort or wear jewels; this cannot be her.” Turning away in modesty, he went on, his mind pure and fixed only on his duty.",
          "At last, in despair, he sat down upon a wall and prayed. “I bow to Rāma and Lakṣmaṇa; I bow to Sītā, daughter of Janaka. May they guide me.” Then his eyes fell upon a dark grove of aśoka trees that he had not yet searched."
        ],
        "place": "lanka"
      },
      {
        "title": "Sītā in the Aśoka Grove",
        "dev": "अशोक वाटिका में सीता",
        "chars": [
          "sita",
          "hanuman"
        ],
        "text": [
          "Hidden among the leaves of a tall śiṃśapā tree, Hanumān looked down. There, on the bare ground, surrounded by fierce rākṣasī guards, sat a lady clothed in a single faded yellow garment, pale and thin with fasting, her long hair in a single braid. Her eyes were filled with tears, and her lips moved constantly, repeating “Rāma, Rāma.” She shone like the moon behind clouds.",
          "Hanumān’s heart overflowed. “This is Sītā, the beloved of Rāma. Even in sorrow her purity shines like a flame. Truly, she is worthy of Rāma, and Rāma is worthy of her.” Tears of joy ran down his face as he bowed to her in his heart."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "The Blade of Grass",
        "dev": "तृण की ओट",
        "chars": [
          "ravana",
          "sita"
        ],
        "text": [
          "Before dawn, Rāvaṇa came into the grove with his queens and attendants, carrying torches, and stood before Sītā. Sītā drew her garment close about her and turned her face away. She picked up a single blade of grass and placed it between herself and him, and spoke only to the grass, never once raising her eyes to Rāvaṇa.",
          "“Rāvaṇa, turn your mind to your own queens and to dharma,” she said. “To me, all your kingdom is worth less than this blade of grass. Return me to Rāma while you still can, or his arrows will turn your golden Laṅkā to ashes.”",
          "Rāvaṇa’s ten faces flushed with rage. “I give you two more months, Sītā. If you do not accept me by then, you will die.” He strode away in fury, ordering the rākṣasīs to break her will with threats."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "Trijaṭā’s Dream",
        "dev": "त्रिजटा का स्वप्न",
        "chars": [
          "trijata",
          "sita"
        ],
        "text": [
          "When the rākṣasīs gathered around Sītā with cruel threats, an old rākṣasī named Trijaṭā rose and silenced them. “Last night I had a dream,” she said. “I saw Rāma in white garments on a white elephant, shining like the sun, and Sītā clothed in white beside him. And I saw Rāvaṇa, smeared with oil, riding south on a donkey toward the land of death. Do not harm this lady; she will be our protection when Rāma comes.”"
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "Hanumān Sings of Rāma",
        "dev": "राम कथा और मुद्रिका",
        "chars": [
          "hanuman",
          "sita"
        ],
        "text": [
          "When the guards had fallen asleep, Hanumān began to sing softly from the tree, telling the story of Rāma from his birth to the search for Sītā. Sītā looked up in wonder at the small vānara among the leaves. “Am I dreaming? Who are you who speaks of my Lord?”",
          "Hanumān came down and bowed before her with folded hands. “Mother, I am Hanumān, servant of Rāma, son of the Wind. Rāma grieves for you every moment, and he sent me to find you.” Then he placed Rāma’s ring in her hand.",
          "Sītā pressed the ring to her heart and to her eyes, and wept as if she had seen Rāma himself. “Hanumān, you have given me back my life. Tell my lord that I can live only one month more.”"
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "The Cūḍāmaṇi",
        "dev": "चूड़ामणि",
        "chars": [
          "sita",
          "hanuman"
        ],
        "text": [
          "Hanumān offered to carry her on his back across the ocean that very moment. Sītā gently refused. “It is for Rāma to come and defeat Rāvaṇa and take me home with honour, as is his dharma. And I will not willingly touch any male but my lord.”",
          "From her hair she took the cūḍāmaṇi, a shining jewel her mother had given her on her wedding day, and placed it in Hanumān’s hands. “Give this to Rāma, and remind him of the day at Citrakūṭa when he struck a crow with a blade of grass to protect me. Tell him to come quickly.” Hanumān bowed and touched her feet in his heart."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "The Grove Destroyed",
        "dev": "अशोक वाटिका विध्वंस",
        "chars": [
          "hanuman",
          "akshakumara"
        ],
        "text": [
          "Before leaving, Hanumān resolved to test the strength of Laṅkā and give Rāvaṇa a warning. He grew to an enormous size and tore up the trees of the Aśoka grove, leaving untouched only the śiṃśapā tree beneath which Sītā sat.",
          "Rāvaṇa sent eighty thousand warriors, and Hanumān struck them down with an iron bar. Then came Akṣakumāra, Rāvaṇa’s young son, in a golden chariot. Hanumān admired his courage, but he leapt into the sky, seized the prince, and the young warrior fell."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "Bound by the Brahmāstra",
        "dev": "ब्रह्मास्त्र बन्धन",
        "chars": [
          "hanuman",
          "indrajit"
        ],
        "text": [
          "Then Rāvaṇa sent his mightiest son, Indrajit, the conqueror of Indra. Their battle shook the city, and at last Indrajit loosed the Brahmāstra. Out of reverence for Brahmā, Hanumān allowed himself to be bound and fell to the ground. “Now I shall meet Rāvaṇa face to face,” he thought."
        ],
        "place": "lanka"
      },
      {
        "title": "Hanumān in Rāvaṇa’s Court",
        "dev": "रावण दरबार में हनुमान",
        "chars": [
          "hanuman",
          "ravana",
          "vibhishana",
          "indrajit"
        ],
        "text": [
          "Hanumān was dragged into Rāvaṇa’s court, where the ten-headed king sat on a crystal throne, blazing with jewels. Hanumān coiled his long tail into a seat higher than the throne and sat upon it, gazing calmly at Rāvaṇa.",
          "“I am the messenger of Rāma,” he declared. “Return Sītā to him with honour and ask his forgiveness, and he may spare you. Otherwise, not all the gods can save you or your golden city.” Rāvaṇa roared with anger and ordered his death, but his wise brother Vibhīṣaṇa reminded him that a messenger must never be killed. So Rāvaṇa commanded, “Then set fire to his tail.”"
        ],
        "place": "lanka"
      },
      {
        "title": "Laṅkā Burns",
        "dev": "लंका दहन",
        "chars": [
          "hanuman"
        ],
        "text": [
          "The rākṣasas wrapped Hanumān’s tail in cloth soaked in oil and set it ablaze, then paraded him through the streets as the people laughed. But Sītā, hearing of it, prayed to Agni, the god of fire, “If I have been true to my lord, be cool to Hanumān.” And the fire did not burn him at all.",
          "Suddenly Hanumān shrank, slipped free of his bonds, and grew to the size of a mountain. Leaping from rooftop to rooftop, he set Laṅkā ablaze with his burning tail. Golden palaces melted, towers crashed, and the city of gold glowed red against the night sky, while Vibhīṣaṇa’s house alone was spared."
        ],
        "place": "lanka"
      },
      {
        "title": "Sītā Unharmed",
        "dev": "सीता की कुशलता",
        "chars": [
          "hanuman",
          "sita"
        ],
        "text": [
          "Then a terrible fear seized Hanumān. “Have I burned Sītā too, in my anger?” He quenched his tail in the ocean and raced to the Aśoka grove. There sat Sītā under the śiṃśapā tree, untouched by the fire. Hanumān bowed before her with joy, took her blessing, and leapt back across the ocean."
        ],
        "place": "ashoka-vatika"
      },
      {
        "title": "“I Have Seen Sītā”",
        "dev": "दृष्टा सीता",
        "chars": [
          "hanuman",
          "rama",
          "lakshmana",
          "sugriva",
          "angada",
          "jambavan"
        ],
        "text": [
          "On the northern shore the vānaras heard his roar and danced with joy. Hanumān landed among them and cried, “I have seen Sītā!” In their celebration they feasted on the honey of Sugrīva’s garden, Madhuvana, and hurried back to Rāma.",
          "Hanumān bowed at Rāma’s feet and said, “Dṛṣṭā Sītā: I have seen Sītā, faithful and pure, waiting for you.” He told everything and placed the cūḍāmaṇi in Rāma’s hand. Rāma pressed the jewel to his heart and wept. Then he embraced Hanumān, saying, “What can I ever give you, Hanumān, for giving me back my life? All I have is this embrace.” Hanumān fell at his feet, wanting nothing in the world but to serve him."
        ],
        "place": "kishkindha"
      }
    ]
  },
  {
    "id": "yuddha",
    "num": 6,
    "name": "Yuddha Kāṇḍa",
    "dev": "युद्धकाण्ड",
    "subtitle": "The Book of War",
    "accent": "#ff5a3c",
    "summary": "Vibhīṣaṇa takes refuge at Rāma’s feet, and the vānaras build a bridge of floating stones, each bearing the name of Rāma. Aṅgada’s foot cannot be moved, Kumbhakarṇa wakes and falls, and Hanumān carries the mountain of healing herbs to save Lakṣmaṇa. Blessed by the Āditya-hṛdayam, Rāma slays Rāvaṇa. Agni himself bears witness to Sītā’s purity, and Rāma returns home in the Puṣpaka to be crowned.",
    "episodes": [
      {
        "title": "The March to the Sea",
        "dev": "समुद्र तट की ओर",
        "chars": [
          "rama",
          "lakshmana",
          "sugriva",
          "hanuman",
          "angada",
          "jambavan"
        ],
        "text": [
          "At an auspicious hour Rāma set out for the south, and the vānara army followed him like an ocean in flood, roaring “Jai Śrī Rām!” Hanumān carried Rāma on his shoulders, and Aṅgada carried Lakṣmaṇa. They crossed mountains, forests and rivers, until at last they reached the shore of the great southern ocean, whose waves stretched to the end of the sky."
        ],
        "place": "kishkindha"
      },
      {
        "title": "Vibhīṣaṇa’s Counsel",
        "dev": "विभीषण का परामर्श",
        "chars": [
          "ravana",
          "vibhishana",
          "kumbhakarna",
          "indrajit"
        ],
        "text": [
          "In Laṅkā Rāvaṇa called his council. His ministers boasted of victory, but his younger brother Vibhīṣaṇa stood up with folded hands. “Brother, Sītā is like a blazing fire in our house. Return her to Rāma with honour, and save Laṅkā and all our people.”",
          "Rāvaṇa’s eyes burned. “You are a traitor who praises my enemy! If you were not my brother, I would kill you.” And he kicked Vibhīṣaṇa from the steps of the throne. Vibhīṣaṇa rose with dignity. “I have given you good counsel, brother, but you will not hear it. Farewell.” With four faithful companions he flew across the ocean to Rāma."
        ],
        "place": "lanka"
      },
      {
        "title": "The Refuge of Vibhīṣaṇa",
        "dev": "विभीषण शरणागति",
        "chars": [
          "vibhishana",
          "rama",
          "sugriva",
          "hanuman",
          "lakshmana"
        ],
        "text": [
          "Seeing a rākṣasa in the sky, the vānaras cried, “It is a spy of Rāvaṇa! Kill him!” Only Hanumān said, “I see goodness in his face.” Rāma raised his hand and spoke a vow that the devout remember forever. “Whoever comes to me even once, saying ‘I am yours,’ I give him freedom from fear from all beings. This is my vow. Even if Rāvaṇa himself came, I would protect him.”",
          "Vibhīṣaṇa fell at Rāma’s feet in tears. Rāma raised him up and, with water from the ocean, crowned him king of Laṅkā then and there, before the war had even begun."
        ]
      },
      {
        "title": "Rāma and the Ocean",
        "dev": "राम और समुद्र",
        "chars": [
          "rama",
          "samudra",
          "lakshmana"
        ],
        "text": [
          "For three days Rāma lay upon a bed of kuśa grass on the shore, praying to the Ocean for a path. The Ocean did not answer. Then Rāma rose in anger and set a fiery arrow to his bow, and the waters boiled and trembled.",
          "From the depths rose Samudra, the lord of the ocean, crowned with pearls, bowing with folded hands. “Forgive me, Lord. My nature is to be deep and boundless; I cannot dry up. But Nala, son of Viśvakarmā, can build a bridge upon me, and I will hold up every stone.”"
        ],
        "place": "rameswaram"
      },
      {
        "title": "The Bridge of Rāma’s Name",
        "dev": "राम सेतु",
        "chars": [
          "nala",
          "nila",
          "hanuman",
          "rama",
          "lakshmana",
          "sugriva"
        ],
        "text": [
          "The vānaras uprooted rocks, trees and whole hills and carried them to the shore. On every stone they wrote the name “Rāma,” and wonder of wonders, each stone floated upon the waves. Nala and Nīla laid the stones one upon another, and the bridge stretched out across the sea.",
          "Among the mighty vānaras, a little squirrel worked tirelessly, rolling in the sand and shaking it off between the stones. Rāma lifted it tenderly in his palm and stroked its back with three fingers, and it is said that the squirrel still bears those three stripes. In five days the bridge was complete, a hundred yojanas long, and the gods looked down in wonder."
        ],
        "place": "setu"
      },
      {
        "title": "The Liṅga at Rāmeśvaram",
        "dev": "रामेश्वरम्",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "hanuman"
        ],
        "text": [
          "Before crossing the ocean, Rāma made a liṅga of sand on the shore and worshipped Lord Śiva with devotion, praying for victory in a righteous war. That holy place is still called Rāmeśvaram, the place of Rāma’s Lord."
        ],
        "place": "rameswaram"
      },
      {
        "title": "Aṅgada’s Foot",
        "dev": "अंगद का पाँव",
        "chars": [
          "angada",
          "ravana",
          "indrajit"
        ],
        "text": [
          "Before the war, Rāma sent Aṅgada to Rāvaṇa as his envoy, to offer peace one last time. In Rāvaṇa’s court Aṅgada declared, “Return Sītā and seek Rāma’s mercy, and you will live.” The court laughed in scorn.",
          "Then Aṅgada planted his foot upon the floor. “If any warrior here can move my foot, Rāma will turn back and Sītā will be lost to him forever.” One by one the mightiest rākṣasas strained and pulled, and none could move it even a hair’s breadth. At last Rāvaṇa himself rose to try, and Aṅgada stepped back. “Why touch my feet, Rāvaṇa? Fall at Rāma’s feet, and you will be saved.” And he leapt into the sky and flew back to Rāma."
        ],
        "place": "lanka"
      },
      {
        "title": "The Siege Begins",
        "dev": "लंका पर आक्रमण",
        "chars": [
          "rama",
          "lakshmana",
          "hanuman",
          "sugriva",
          "angada",
          "nila"
        ],
        "text": [
          "The vānara army surrounded Laṅkā on every side and attacked its four great gates, hurling rocks and trees against its golden walls. The rākṣasas poured out with spears, maces and arrows, and the great battle began. Conches blew, drums thundered, and the earth shook beneath the warriors."
        ],
        "place": "lanka"
      },
      {
        "title": "The Serpent Arrows",
        "dev": "नागपाश",
        "chars": [
          "rama",
          "lakshmana",
          "indrajit",
          "garuda"
        ],
        "text": [
          "Indrajit, invisible in the clouds through his sorcery, loosed a rain of serpent arrows that bound Rāma and Lakṣmaṇa in coils of snakes. The two brothers fell to the ground as if dead, and the vānaras wept.",
          "Then a great wind arose, and Garuḍa, the king of birds and the enemy of serpents, swept down from the sky. At the very sight of him the serpents fled, and Rāma and Lakṣmaṇa rose, their wounds healed and their strength renewed. The vānaras roared for joy."
        ],
        "place": "lanka"
      },
      {
        "title": "Rāvaṇa’s First Battle",
        "dev": "रावण का प्रथम युद्ध",
        "chars": [
          "ravana",
          "rama",
          "lakshmana",
          "hanuman"
        ],
        "text": [
          "Rāvaṇa himself rode into battle and struck down Lakṣmaṇa with a mighty spear. Hanumān lifted the wounded prince, and Rāvaṇa could not even move him, for Lakṣmaṇa was light only in the arms of love.",
          "Then Rāma rode upon Hanumān’s shoulders and faced Rāvaṇa. His arrows shattered Rāvaṇa’s chariot, his bow and his crown. Standing before the defenceless king, Rāma lowered his bow. “You are weary, Rāvaṇa. Go home and rest, and come back tomorrow to fight.” Humiliated, Rāvaṇa returned to his palace."
        ],
        "place": "lanka"
      },
      {
        "title": "Kumbhakarṇa Awakens",
        "dev": "कुम्भकर्ण जागरण",
        "chars": [
          "kumbhakarna",
          "ravana"
        ],
        "text": [
          "Desperate, Rāvaṇa ordered his giant brother Kumbhakarṇa to be woken from his long sleep. The rākṣasas blew conches and beat drums, drove elephants over him and poured water on him, and at last the giant awoke, ravenous and yawning like a cavern.",
          "Kumbhakarṇa too told Rāvaṇa that he had done wrong to take Sītā. “But you are my brother and my king, and I will fight for you.” He strode out of the gates, taller than the walls of Laṅkā, and the vānaras scattered before him like leaves in a storm."
        ],
        "place": "lanka"
      },
      {
        "title": "The Fall of Kumbhakarṇa",
        "dev": "कुम्भकर्ण वध",
        "chars": [
          "kumbhakarna",
          "rama",
          "sugriva",
          "hanuman"
        ],
        "text": [
          "Kumbhakarṇa seized Sugrīva and carried him toward Laṅkā, but Sugrīva woke and escaped. Then the giant turned toward Rāma. Rāma loosed his divine arrows, cutting off his arms and then his legs, and at last, with the weapon of Indra, he struck off the giant’s head. Kumbhakarṇa fell like a mountain, and the rākṣasas fled in terror."
        ],
        "place": "lanka"
      },
      {
        "title": "Lakṣmaṇa and the Sañjīvanī",
        "dev": "संजीवनी",
        "chars": [
          "lakshmana",
          "indrajit",
          "hanuman",
          "sushena",
          "rama"
        ],
        "text": [
          "In a fierce battle Indrajit loosed the deadly Śakti weapon at Lakṣmaṇa, and it struck him in the chest. Lakṣmaṇa fell senseless, and Rāma took his brother’s head in his lap and wept. “Without Lakṣmaṇa, what is victory to me? I cannot return to Ayodhyā and face his mother.”",
          "The physician Suṣeṇa said, “Only the Sañjīvanī herb that grows on a mountain in the Himālaya can save him, and it must be brought before dawn.” Hanumān flew north like the wind. When he could not tell which herb was the Sañjīvanī, he lifted the whole glowing mountain in one hand and flew back with it across the night sky.",
          "Suṣeṇa crushed the herb and held it to Lakṣmaṇa’s face, and Lakṣmaṇa opened his eyes as if waking from sleep. Rāma embraced Hanumān, saying, “You are as dear to me as my brother Bharata.”"
        ],
        "place": "lanka"
      },
      {
        "title": "The Fall of Indrajit",
        "dev": "इन्द्रजित वध",
        "chars": [
          "lakshmana",
          "indrajit",
          "vibhishana",
          "hanuman"
        ],
        "text": [
          "Vibhīṣaṇa revealed that Indrajit was performing a secret sacrifice at Nikumbhilā, which would make him invincible. Lakṣmaṇa went there with Vibhīṣaṇa and Hanumān and broke the sacrifice before it was complete.",
          "For three days Lakṣmaṇa and Indrajit fought, their divine weapons blazing across the sky. At last Lakṣmaṇa set an arrow to his bow with the words, “If Rāma is truly devoted to dharma and truth, may this arrow slay Indrajit.” The arrow flew like lightning, and Indrajit, the conqueror of Indra, fell at last."
        ],
        "place": "lanka"
      },
      {
        "title": "Mātali’s Chariot and the Āditya-Hṛdayam",
        "dev": "आदित्य हृदयम्",
        "chars": [
          "rama",
          "agastya",
          "matali"
        ],
        "text": [
          "Mad with grief, Rāvaṇa rode out for the final battle. To make the fight equal, Indra sent his own heavenly chariot, driven by his charioteer Mātali, and Rāma mounted it.",
          "The battle raged for days, and Rāma grew weary. Then the great sage Agastya appeared beside him and taught him the sacred hymn to the Sun, the Āditya-hṛdayam. “Chant this three times, Rāma, and you will conquer your enemy.” Rāma chanted it with a pure heart, facing the rising sun, and new strength flowed into him like light."
        ],
        "place": "lanka"
      },
      {
        "title": "The Fall of Rāvaṇa",
        "dev": "रावण वध",
        "chars": [
          "rama",
          "ravana",
          "vibhishana",
          "matali"
        ],
        "text": [
          "Again and again Rāma’s arrows cut off Rāvaṇa’s heads, and again and again they grew back. Then Vibhīṣaṇa said, “Lord, Rāvaṇa holds the nectar of immortality in his navel. Strike there.”",
          "Rāma invoked the Brahmāstra, the weapon of the Creator, which blazed like the fire at the end of time. He drew it to his ear and loosed it, and it pierced Rāvaṇa’s heart. The ten-headed king fell from his chariot, and his bow slipped from his hands. The gods rained flowers upon Rāma, the heavenly drums sounded, and the whole universe rejoiced."
        ],
        "place": "lanka"
      },
      {
        "title": "Mandodarī’s Lament",
        "dev": "मन्दोदरी विलाप",
        "chars": [
          "mandodari",
          "ravana",
          "vibhishana",
          "rama"
        ],
        "text": [
          "Rāvaṇa’s queens rushed weeping onto the battlefield, and his chief queen Mandodarī fell beside her husband. “You were the mightiest of kings, and you were destroyed by your desire. I begged you to return Sītā.” Rāma comforted Vibhīṣaṇa and asked him to perform his brother’s funeral rites with honour. “Death ends all enmity; he is now as much my brother as yours.”",
          "Then Vibhīṣaṇa was crowned king of Laṅkā, and he vowed to rule by dharma."
        ],
        "place": "lanka"
      },
      {
        "title": "The Ordeal of Fire",
        "dev": "अग्नि परीक्षा",
        "chars": [
          "sita",
          "rama",
          "agni",
          "lakshmana",
          "hanuman"
        ],
        "text": [
          "Hanumān brought the joyful news to Sītā, and she was brought before Rāma, dressed in fine garments by Vibhīṣaṇa’s queens. Before the whole world Rāma said that he had fought to uphold the honour of his line, and that the world must see the truth of Sītā’s purity.",
          "Sītā asked Lakṣmaṇa to build a fire. With folded hands she prayed, “If my heart has never strayed from Rāma for a single moment, may Agni, the witness of all, protect me.” And she walked into the flames.",
          "Then Agni, the god of fire, rose from the flames, carrying Sītā unharmed, more radiant than ever. “Rāma, here is your Sītā, pure and sinless. She never turned to Rāvaṇa even in thought.” Rāma took her hand with joy. “I always knew her purity, but the world had to see it too.” The gods, and even the spirit of King Daśaratha, appeared in the sky to bless them."
        ],
        "place": "lanka"
      },
      {
        "title": "The Puṣpaka Flight Home",
        "dev": "पुष्पक विमान से वापसी",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "hanuman",
          "sugriva",
          "vibhishana"
        ],
        "text": [
          "The fourteen years were coming to an end. Vibhīṣaṇa brought the Puṣpaka vimāna, and Rāma, Sītā and Lakṣmaṇa rose into the sky with Sugrīva, Vibhīṣaṇa, Hanumān and the vānara chiefs. As they flew north, Rāma showed Sītā the places of their journey: the bridge across the sea, Kiṣkindhā, Pañcavaṭī, and the hermitages of the sages.",
          "At Prayāga, Rāma sent Hanumān ahead to Nandigrāma. “Go to Bharata, and see if he still longs for my return.”"
        ]
      },
      {
        "title": "Bharata’s Joy",
        "dev": "भरत मिलन",
        "chars": [
          "bharata",
          "hanuman",
          "rama",
          "shatrughna"
        ],
        "text": [
          "Hanumān found Bharata on the very last day of the fourteen years, thin and dressed in bark, preparing to enter the fire if Rāma did not come. “Rāma is coming!” cried Hanumān, and Bharata embraced him and wept with joy.",
          "Then the Puṣpaka descended from the sky, and Bharata ran forward carrying Rāma’s sandals on his head. He placed them on Rāma’s feet. “Brother, I return to you the kingdom you entrusted to me.” Rāma lifted Bharata up and held him in a long embrace, and the brothers wept together."
        ],
        "place": "nandigram"
      },
      {
        "title": "The Coronation of Śrī Rāma",
        "dev": "राम राज्याभिषेक",
        "chars": [
          "rama",
          "sita",
          "lakshmana",
          "bharata",
          "shatrughna",
          "hanuman",
          "vasishtha"
        ],
        "text": [
          "Ayodhyā lit a million lamps to welcome its king, and to this day Dīpāvalī celebrates that homecoming. Rāma and Sītā sat upon the golden throne, Vasiṣṭha placed the crown upon Rāma’s head, Lakṣmaṇa held the royal umbrella, Bharata and Śatrughna waved the fans, and Hanumān knelt at their feet with folded hands.",
          "Sītā gave Hanumān a necklace of priceless pearls. He broke the pearls open one by one, looking inside each. When the court laughed, Hanumān said, “I see no Rāma in them, so they are worthless to me.” Then he tore open his own chest, and there, in his heart, Rāma and Sītā shone for all to see.",
          "So began Rāma Rājya, the reign of Rāma. In his kingdom there was no disease and no untimely death, the rains came in their season, the fields were full, and every person lived by dharma in peace and joy."
        ],
        "place": "ayodhya"
      }
    ]
  },
  {
    "id": "uttara",
    "num": 7,
    "name": "Uttara Kāṇḍa",
    "dev": "उत्तरकाण्ड",
    "subtitle": "The Final Book",
    "accent": "#9bb8ff",
    "summary": "The hidden histories of Rāvaṇa and of Hanumān’s childhood are told, and the curse that kept Rāvaṇa from ever touching Sītā. For the sake of his people, King Rāma parts from Sītā, who finds refuge in Vālmīki’s hermitage and gives birth to Lava and Kuśa. The twins sing the Rāmāyaṇa before their father, Sītā returns to the arms of Mother Earth, and Rāma departs for his eternal abode through the waters of the Sarayū.",
    "episodes": [
      {
        "title": "The Birth of Rāvaṇa",
        "dev": "रावण का जन्म",
        "chars": [
          "kaikesi",
          "ravana",
          "kumbhakarna",
          "vibhishana",
          "shurpanakha"
        ],
        "text": [
          "In the court of Ayodhyā, the sage Agastya told Rāma the hidden history of his enemy. Long ago the rākṣasa Sumāli, driven out of Laṅkā by Lord Viṣṇu, sent his daughter Kaikasī to the sage Viśravas, so that she might bear him mighty sons. She gave birth to Rāvaṇa, with ten heads and twenty arms, to the giant Kumbhakarṇa, to the gentle and righteous Vibhīṣaṇa, and to a daughter, Śūrpaṇakhā."
        ],
        "place": "lanka"
      },
      {
        "title": "Penance and Boons",
        "dev": "तपस्या और वरदान",
        "chars": [
          "ravana",
          "kumbhakarna",
          "vibhishana",
          "brahma"
        ],
        "text": [
          "The three brothers went into the forest and performed terrible penance for thousands of years. Rāvaṇa offered his own heads one by one into the sacred fire, and as he was about to offer the tenth, Brahmā appeared and granted him a boon: that no god, demon, serpent or celestial being could ever slay him. In his pride he did not ask protection from men.",
          "Kumbhakarṇa meant to ask for the throne of Indra, but the goddess of speech twisted his tongue, and he asked instead for endless sleep. Vibhīṣaṇa asked only that his mind should always remain fixed on dharma, and Brahmā blessed him with immortality."
        ],
        "place": "himalaya"
      },
      {
        "title": "The Puṣpaka Vimāna",
        "dev": "पुष्पक विमान",
        "chars": [
          "ravana",
          "kubera"
        ],
        "text": [
          "Laṅkā then belonged to Kubera, the lord of wealth, who was Rāvaṇa’s own half-brother. Rāvaṇa drove him out of the golden city and seized his greatest treasure, the Puṣpaka vimāna, a flying chariot like a palace of gold, which moved wherever its master wished."
        ],
        "place": "lanka"
      },
      {
        "title": "Rāvaṇa and Kailāsa",
        "dev": "रावण और कैलाश",
        "chars": [
          "ravana",
          "shiva"
        ],
        "text": [
          "Flying over the Himālaya, the Puṣpaka suddenly stopped above Mount Kailāsa, the abode of Lord Śiva. Enraged, Rāvaṇa thrust his twenty arms beneath the mountain and began to lift it. Lord Śiva, smiling, pressed down gently with one toe, and Rāvaṇa’s arms were crushed beneath the mountain.",
          "Crying out in pain, Rāvaṇa sang hymns of praise to Śiva for a thousand years. Pleased by his devotion, Śiva freed him, gave him the sword Candrahāsa, and named him Rāvaṇa, “the one who roared”."
        ],
        "place": "kailasa"
      },
      {
        "title": "Vedavatī’s Vow",
        "dev": "वेदवती",
        "chars": [
          "ravana"
        ],
        "text": [
          "In a forest of the Himālaya, Rāvaṇa came upon Vedavatī, a pure maiden seated in penance, devoted to Lord Viṣṇu. He insulted her, and she rose in blazing anger. “I will not live in a body you have dishonoured with your gaze. I will be born again to bring about your destruction.” She entered the sacred fire, and it is said she was reborn as Sītā."
        ],
        "place": "himalaya"
      },
      {
        "title": "The Curse That Protected Sītā",
        "dev": "नलकूबर का शाप",
        "chars": [
          "ravana",
          "kubera"
        ],
        "text": [
          "In his arrogance, Rāvaṇa once dishonoured a lady of the heavens who was promised to Nalakūbara, the son of Kubera. Nalakūbara, his eyes red with anger, took water in his hand and spoke a curse. “If Rāvaṇa ever forces himself upon any woman against her will, his ten heads shall burst into a hundred pieces.” Because of this curse, Rāvaṇa never dared to lay a hand upon Sītā, and her purity remained untouched as a flame."
        ]
      },
      {
        "title": "The Childhood of Hanumān",
        "dev": "हनुमान का बचपन",
        "chars": [
          "hanuman",
          "vayu",
          "indra",
          "brahma"
        ],
        "text": [
          "Agastya then told the story of Hanumān. Born to Añjanā and the Wind god Vāyu, the infant Hanumān woke one morning hungry and saw the rising sun. Thinking it a ripe red fruit, he leapt into the sky to eat it.",
          "Indra struck the child with his thunderbolt, and he fell to the earth with a wounded jaw, which is why he is called Hanumān. In grief and anger the Wind god withdrew from the world, and all beings began to choke. The gods hurried to heal the child, and each blessed him with a boon: Brahmā made him safe from every weapon, Indra gave him a body like a thunderbolt, and he was granted the power to change his form at will.",
          "But the little Hanumān grew playful and troubled the sages in their hermitages. So they gently cursed him to forget his powers until someone reminded him of them. That is why he sat silent on the ocean shore, until Jāmbavān awakened his strength."
        ]
      },
      {
        "title": "Hanumān’s Boon",
        "dev": "हनुमान का वरदान",
        "chars": [
          "rama",
          "hanuman",
          "sita"
        ],
        "text": [
          "When the time came for the vānaras to return to their homes, Rāma embraced each of them with love. Hanumān knelt before him and asked for a single boon. “Lord, let me live on this earth for as long as your story is told among men.” Rāma blessed him. “So be it, Hanumān. As long as my name is spoken in the world, you shall live, and wherever my story is sung, you shall be there.” And so, it is said, wherever the Rāmāyaṇa is sung, Hanumān sits listening with folded hands and tears in his eyes."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Whisper in the Kingdom",
        "dev": "लोकापवाद",
        "chars": [
          "rama",
          "lakshmana",
          "bharata",
          "shatrughna"
        ],
        "text": [
          "Years passed in peace and joy, and Sītā was expecting a child. One evening Rāma asked his trusted friend Bhadra what the people said of their king. Hesitating, Bhadra told him that some in the city whispered that Sītā had lived in Rāvaṇa’s kingdom, and asked how a king could take her back.",
          "Rāma’s heart was torn in two. He knew Sītā was pure, but a king must stand beyond every shadow of doubt in the eyes of his people. He called his brothers, and with tears in his eyes said, “Lakṣmaṇa, take Sītā to the hermitage of Vālmīki by the Gaṅgā. My duty as king demands it, though it breaks my heart.”"
        ],
        "place": "ayodhya"
      },
      {
        "title": "Sītā in Vālmīki’s Hermitage",
        "dev": "वाल्मीकि आश्रम में सीता",
        "chars": [
          "sita",
          "lakshmana",
          "valmiki"
        ],
        "text": [
          "Lakṣmaṇa drove Sītā to the banks of the Gaṅgā, and there, weeping, he told her of Rāma’s command. Sītā received the news with quiet dignity. “Tell my lord that I hold no grievance. He must protect his people as a king, and I will pray for him every day of my life.” Lakṣmaṇa touched her feet and departed in tears.",
          "The sage Vālmīki came to her, having seen everything in meditation. “Daughter of Janaka, come to my hermitage. You will be my daughter, and the women of my āśrama will care for you.” And there, among the sages and the deer, Sītā lived in peace and prayer. In Ayodhyā Rāma never took another wife, and at every sacred rite a golden image of Sītā sat beside him."
        ],
        "place": "valmiki-ashram"
      },
      {
        "title": "The Birth of Lava and Kuśa",
        "dev": "लव-कुश जन्म",
        "chars": [
          "sita",
          "lava",
          "kusha",
          "valmiki",
          "shatrughna"
        ],
        "text": [
          "On the very night that Śatrughna, on his way to battle, rested at Vālmīki’s hermitage, Sītā gave birth to twin sons. Vālmīki blessed them with sacred grass, naming the elder Kuśa and the younger Lava.",
          "The boys grew up radiant like their father, learning the Vedas, archery and music from the sage. And Vālmīki taught them the Rāmāyaṇa, the story of their own father, which they sang with voices that moved even the birds to silence, never knowing that it was their own story."
        ],
        "place": "valmiki-ashram"
      },
      {
        "title": "The Horse of the Aśvamedha",
        "dev": "अश्वमेध का अश्व",
        "chars": [
          "lava",
          "kusha",
          "shatrughna",
          "lakshmana",
          "hanuman"
        ],
        "text": [
          "Rāma performed the great Aśvamedha sacrifice, and its sacred horse wandered freely across the land, guarded by Śatrughna and the army of Ayodhyā. When the horse came into the forest near Vālmīki’s hermitage, the young Lava read the challenge on its golden plate and tied it to a tree. “We accept the challenge.”",
          "Śatrughna’s army came to free the horse, and the two boys defeated them all with their arrows. Then came Lakṣmaṇa, and even he could not overcome them. Last came Hanumān, who recognised Rāma’s light in the boys’ faces, and with a smile allowed them to bind him and lead him to their mother. Seeing him, Sītā gently asked her sons to set him free and to return the horse."
        ],
        "place": "valmiki-ashram"
      },
      {
        "title": "The Song of the Rāmāyaṇa",
        "dev": "रामायण गान",
        "chars": [
          "lava",
          "kusha",
          "rama",
          "valmiki"
        ],
        "text": [
          "Vālmīki brought Lava and Kuśa to Ayodhyā, and in the great hall of the Aśvamedha the twins sang the Rāmāyaṇa before King Rāma and the whole assembly. Their voices were so sweet and the story so true that the entire court wept as they sang.",
          "Day after day Rāma listened. When he learned that the two singers were the sons of Sītā, his own sons, he rose from his throne and embraced them with tears, and asked Vālmīki to bring Sītā to the court."
        ],
        "place": "ayodhya"
      },
      {
        "title": "Sītā Returns to the Earth",
        "dev": "सीता का भू-प्रवेश",
        "chars": [
          "sita",
          "valmiki",
          "rama",
          "bhudevi",
          "lava",
          "kusha"
        ],
        "text": [
          "Sītā came into the assembly behind Vālmīki, clothed in simple saffron, her eyes lowered and her hands folded. Vālmīki declared, “I have never spoken an untruth; Sītā is pure, and these are your sons.”",
          "Then Sītā folded her hands and prayed. “If I have never thought of anyone but Rāma, may Mother Earth take me back into her arms.” The earth opened, and a divine golden throne rose up, upon which sat the goddess Bhūdevi, the Earth herself. She embraced her daughter, seated Sītā beside her on the throne, and they descended into the earth as flowers rained from the sky.",
          "Rāma cried out in grief and anger, but Brahmā consoled him. “Do not grieve, Rāma. You and Sītā will meet again in your eternal abode.”"
        ],
        "place": "ayodhya"
      },
      {
        "title": "Kāla’s Visit",
        "dev": "काल का आगमन",
        "chars": [
          "kala",
          "rama",
          "lakshmana",
          "durvasa"
        ],
        "text": [
          "After many thousands of years, Kāla, the god of Time, came to Rāma in the form of an ascetic. “I must speak with you alone. Whoever interrupts us must be banished.” Rāma set Lakṣmaṇa at the door. Kāla told Rāma that his work on earth was done and that it was time to return to his eternal abode.",
          "Just then the fiery sage Durvāsā arrived and demanded to see Rāma at once, threatening to curse the whole kingdom. To save Ayodhyā, Lakṣmaṇa entered the room, knowing his fate. Rāma, heartbroken, sent him away. Lakṣmaṇa went to the Sarayū, sat in meditation, and was received into heaven."
        ],
        "place": "ayodhya"
      },
      {
        "title": "The Great Departure",
        "dev": "महाप्रस्थान",
        "chars": [
          "rama",
          "bharata",
          "shatrughna",
          "hanuman",
          "lava",
          "kusha",
          "brahma"
        ],
        "text": [
          "Rāma divided his kingdom between Lava and Kuśa, and set out for the Sarayū with Bharata and Śatrughna. The whole city followed him: the people, the vānaras and the bears, all chanting his name. Only Hanumān stayed behind, as he had vowed, to live on earth as long as Rāma’s story is told.",
          "At the river’s edge Brahmā and all the gods appeared in the sky. Rāma stepped into the waters of the Sarayū, and as the gods sang, he shone forth in his divine form as Lord Viṣṇu and ascended to his eternal abode, with all who loved him.",
          "This is the story of Rāma, first sung by Vālmīki. Whoever hears it with devotion is freed from sorrow, and blessed with long life, peace and the grace of Śrī Rāma. Jai Śrī Rām."
        ],
        "place": "ayodhya"
      }
    ]
  }
];
