// Great duels of the Vālmīki Rāmāyaṇa, staged as cinematic encounters.
// `hp` values are dramatic pacing only: how each round shifts the balance.

export const DUELS = [
  {
    id: 'rama-tataka', kanda: 'Bāla Kāṇḍa', place: 'Tāṭakā Vana',
    left: 'rama', right: 'tataka', arena: '#3a2a10',
    rounds: [
      { title: 'The Storm of Stones', text: 'Tāṭakā rushes in, roaring, raising a whirlwind of dust and raining boulders on the princes.', hp: [92, 100] },
      { title: 'Illusion', text: 'She vanishes by sorcery and strikes from the air. Rāma and Lakṣmaṇa answer with arrows that find their mark by sound alone.', hp: [86, 64] },
      { title: 'One Arrow', text: 'At Viśvāmitra’s word, “Dusk is coming, when rākṣasas grow stronger. Strike now!”, Rāma looses a single arrow that pierces her heart.', hp: [86, 0] }
    ],
    outcome: 'Tāṭakā falls. The forest of Malada and Karūṣa is freed, and Viśvāmitra gives Rāma the divine astras.'
  },
  {
    id: 'rama-subahu', kanda: 'Bāla Kāṇḍa', place: 'Siddhāśrama',
    left: 'rama', right: 'mareecha', rightAlt: 'subahu', arena: '#2a1a0a',
    rounds: [
      { title: 'Blood Upon the Altar', text: 'On the sixth night the sky darkens. Mārīca and Subāhu swoop down to pour blood on the sacred fire.', hp: [100, 100] },
      { title: 'Mānavāstra', text: 'Rāma invokes the Mānavāstra. It strikes Mārīca in the chest and hurls him a hundred yojanas into the ocean, alive.', hp: [100, 55] },
      { title: 'Āgneyāstra', text: 'The fire-weapon blazes from Rāma’s bow. Subāhu is consumed. The Vāyavyāstra scatters the rest of the horde.', hp: [100, 0] }
    ],
    outcome: 'The sacrifice is completed. Mārīca survives, and fears Rāma for the rest of his life.'
  },
  {
    id: 'jatayu-ravana', kanda: 'Araṇya Kāṇḍa', place: 'Skies over Daṇḍaka',
    left: 'jatayu', right: 'ravana', arena: '#1a1020',
    rounds: [
      { title: 'The Challenge', text: '“I am old, and you are young, armoured, in a chariot. Yet while I live, you shall not carry off Sītā.”', hp: [100, 100] },
      { title: 'Talons and Wings', text: 'Jaṭāyu shatters Rāvaṇa’s bow, kills the charioteer and the donkeys, and tears at his heads and arms. The chariot crashes.', hp: [70, 52] },
      { title: 'Chandrahāsa', text: 'Rāvaṇa seizes Sītā, leaps into the sky, then turns and slashes off the old vulture’s wings with his sword.', hp: [0, 48] }
    ],
    outcome: 'Jaṭāyu falls, still alive, and lives just long enough to tell Rāma that Sītā was taken south. Rāma cremates him as his own father.'
  },
  {
    id: 'rama-khara', kanda: 'Araṇya Kāṇḍa', place: 'Janasthāna',
    left: 'rama', right: 'khara', arena: '#2a0d0d',
    rounds: [
      { title: 'Fourteen Thousand', text: 'Khara, Dūṣaṇa and Triśiras surround Rāma with fourteen thousand rākṣasas. Rāma stands alone.', hp: [100, 100] },
      { title: 'The Circle of Fire', text: 'Rāma’s bow is drawn so fast that it seems a constant circle. Dūṣaṇa falls, then Triśiras. The army is gone in an hour.', hp: [90, 40] },
      { title: 'Indra’s Arrow', text: 'Khara hurls his mace and fights on with fury. Rāma sets an arrow given by Indra on his bow and strikes him down.', hp: [86, 0] }
    ],
    outcome: 'Janasthāna is cleared of rākṣasas. The survivor Akampana flees to Laṅkā.'
  },
  {
    id: 'vali-sugriva', kanda: 'Kiṣkindhā Kāṇḍa', place: 'Gates of Kiṣkindhā',
    left: 'sugriva', right: 'vali', arena: '#2a2008',
    rounds: [
      { title: 'Brother Against Brother', text: 'The two vānara kings collide like planets. They look so alike that Rāma cannot tell them apart, and he holds his arrow. Sugrīva flees.', hp: [40, 95] },
      { title: 'The Garland', text: 'Wearing a gajapuṣpī garland so Rāma can know him, Sugrīva roars his challenge again. Tārā pleads with Vālī not to go.', hp: [40, 95] },
      { title: 'The Arrow from the Trees', text: 'As Sugrīva weakens, Rāma looses one arrow. It strikes Vālī in the chest like a thunderbolt.', hp: [35, 0] }
    ],
    outcome: 'Vālī questions Rāma on dharma, accepts his answer, and entrusts Angada to him. Sugrīva is crowned.'
  },
  {
    id: 'hanuman-aksha', kanda: 'Sundara Kāṇḍa', place: 'The Aśoka Grove',
    left: 'hanuman', right: 'akshakumara', arena: '#0e2010',
    rounds: [
      { title: 'The Golden Chariot', text: 'Young Prince Akṣa rides out, blazing like fire, and pierces Hanumān with arrows. Hanumān admires his valour.', hp: [88, 100] },
      { title: 'Into the Sky', text: 'Hanumān leaps into the sky. Akṣa follows him with arrows. Hanumān strikes down his eight horses and smashes the chariot.', hp: [84, 60] },
      { title: 'Whirlwind', text: 'Hanumān seizes the prince by the feet, whirls him through the air and dashes him to the ground.', hp: [84, 0] }
    ],
    outcome: 'Rāvaṇa, shaken, sends his greatest son, Indrajit.'
  },
  {
    id: 'nila-prahasta', kanda: 'Yuddha Kāṇḍa', place: 'Eastern Gate',
    left: 'nila', right: 'prahasta', arena: '#2a1206',
    rounds: [
      { title: 'The Commander Rides', text: 'Prahasta, Rāvaṇa’s commander-in-chief, bursts from the gate with a vast host, his arrows covering Nīla.', hp: [70, 100] },
      { title: 'Son of Fire', text: 'Nīla, son of Agni, endures the storm with his eyes closed, then shatters the chariot with a tree.', hp: [60, 60] },
      { title: 'The Rock', text: 'Prahasta charges with a club. Nīla lifts a great rock and brings it down on his head.', hp: [60, 0] }
    ],
    outcome: 'Laṅkā loses its commander-in-chief. Rāvaṇa decides to take the field himself.'
  },
  {
    id: 'rama-kumbhakarna', kanda: 'Yuddha Kāṇḍa', place: 'Before the Gates of Laṅkā',
    left: 'rama', right: 'kumbhakarna', arena: '#1a0a0a',
    rounds: [
      { title: 'The Giant Wakes', text: 'Towering like a mountain, Kumbhakarṇa wades through the army and devours vānaras by the thousands.', hp: [100, 100] },
      { title: 'Sugrīva’s Escape', text: 'He carries off Sugrīva under his arm, but Sugrīva bites off his ears and nose and leaps free.', hp: [100, 88] },
      { title: 'Vāyavya', text: 'Rāma severs the arm with the mace using the Vāyavyāstra, then the other arm, then both legs with crescent arrows.', hp: [96, 30] },
      { title: 'Aindrāstra', text: 'With an arrow charged with Indra’s power, Rāma strikes off the giant’s head. It falls on the gates of Laṅkā.', hp: [96, 0] }
    ],
    outcome: 'Kumbhakarṇa, who told Rāvaṇa he was wrong and still fought for him, falls like a mountain into the sea.'
  },
  {
    id: 'lakshmana-atikaya', kanda: 'Yuddha Kāṇḍa', place: 'Battlefield of Laṅkā',
    left: 'lakshmana', right: 'atikaya', arena: '#10101e',
    rounds: [
      { title: 'Brahmā’s Armour', text: 'Atikāya, son of Rāvaṇa, rides a chariot drawn by a thousand horses. Brahmā’s own armour protects him.', hp: [100, 100] },
      { title: 'Astras in Vain', text: 'Lakṣmaṇa looses the Āgneya, the Saura, the Aindra and more. Atikāya answers each one, and the armour turns them all.', hp: [80, 92] },
      { title: 'The Wind’s Whisper', text: 'Vāyu whispers: “Only the Brahmāstra will pierce that armour.” Lakṣmaṇa invokes it, and Atikāya’s head falls.', hp: [80, 0] }
    ],
    outcome: 'Rāvaṇa’s mightiest son after Indrajit is slain.'
  },
  {
    id: 'lakshmana-indrajit', kanda: 'Yuddha Kāṇḍa', place: 'Nikumbhilā',
    left: 'lakshmana', right: 'indrajit', arena: '#0a1420',
    rounds: [
      { title: 'The Broken Sacrifice', text: 'Led by Vibhīṣaṇa, Lakṣmaṇa attacks Indrajit at the Nikumbhilā shrine before he can finish the sacrifice that would make him invincible.', hp: [100, 100] },
      { title: 'Astra Against Astra', text: 'The battle rages on and on. Varuṇa meets Varuṇa, Raudra meets Raudra, Āgneya meets Sūrya. Neither yields.', hp: [64, 66] },
      { title: 'The Charioteer Falls', text: 'Lakṣmaṇa kills Indrajit’s charioteer, and the vānaras smash his chariot. Indrajit returns with a new one and fights on.', hp: [52, 40] },
      { title: 'The Oath of the Aindrāstra', text: '“If Rāma, son of Daśaratha, is devoted to dharma and true to his word, let this arrow slay Rāvaṇa’s son.” The arrow strikes off Indrajit’s head.', hp: [50, 0] }
    ],
    outcome: 'The conqueror of Indra is no more. The gods rejoice, and Rāma embraces his brother.'
  },
  {
    id: 'rama-ravana', kanda: 'Yuddha Kāṇḍa', place: 'Laṅkā — The Final Battle',
    left: 'rama', right: 'ravana', arena: '#200606', final: true,
    rounds: [
      { title: 'Indra’s Chariot', text: 'Mātali brings Indra’s celestial chariot down from heaven. Rāma mounts it, and the sky fills with astras.', hp: [100, 100] },
      { title: 'Ādityahṛdayam', text: 'Agastya descends and teaches Rāma the hymn to the Sun. Rāma chants it three times and is filled with joy and strength.', hp: [88, 86] },
      { title: 'A Hundred Heads', text: 'Rāma cuts off head after head. Each time a new head grows. More than a hundred fall, and Rāvaṇa still fights.', hp: [80, 54] },
      { title: 'The Brahmāstra', text: 'At Mātali’s reminder, Rāma takes the arrow of Brahmā given by Agastya, with wind in its feathers, fire in its tip, and the weight of Meru. It pierces Rāvaṇa’s heart.', hp: [78, 0] }
    ],
    outcome: '“The sky is like only the sky, the ocean like only the ocean. The battle of Rāma and Rāvaṇa is like only itself.” Dharma triumphs. Flowers rain from heaven.'
  }
];

export const ASTRAS = [
  { id: 'brahmastra', name: 'Brahmāstra', dev: 'ब्रह्मास्त्र', color: '#ffd36b',
    desc: 'The weapon of Brahmā, which never fails. Rāma used it to slay Rāvaṇa, and Lakṣmaṇa used it to slay Atikāya.' },
  { id: 'agneyastra', name: 'Āgneyāstra', dev: 'आग्नेयास्त्र', color: '#ff6a2a',
    desc: 'The fire weapon of Agni. Rāma burned Subāhu with it at Siddhāśrama.' },
  { id: 'aindrastra', name: 'Aindrāstra', dev: 'ऐन्द्रास्त्र', color: '#9fd7ff',
    desc: 'Indra’s weapon. Lakṣmaṇa used it to behead Indrajit, and Rāma to slay Kumbhakarṇa.' },
  { id: 'nagapasha', name: 'Nāga-pāśa', dev: 'नागपाश', color: '#5dff9a',
    desc: 'Indrajit’s serpent-noose, which bound Rāma and Lakṣmaṇa until Garuḍa came.' }
];
