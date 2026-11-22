// Visual specifications for every figure that appears on the animated stage.
// The puppet builder (js/puppet.js) turns these into articulated SVG characters.
//
// kind:     human | vanara | bear | bird | deer | kabandha | crow | serpent
// head:     jata | crown | crown-f | bun-f | sage | sage-f | flame | shiva | rakshasa | rakshasi | bald | child
// garments: dhoti / uttariya / saree colours; valkala = bark garments of exile
// weapon:   bow | mace | sword | trident | axe | staff | vajra | spear | veena | kamandalu | lotus | chakra | none

const SKIN = { rama: '#4f6f8f', fair: '#e2b48a', wheat: '#d29b6c', dusky: '#a8714a', deep: '#7a4a32', ash: '#9fb0c0',
  blue: '#3f6fb0', red: '#c0503a', rak: '#6a3a4a', rak2: '#4a4a62', rak3: '#5a6a3a', gold: '#d8a84a' };

export const CAST = {
  // ── House of Raghu ──
  rama:        { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'jata', dhoti: '#f2a52a', uttariya: '#e8742a', weapon: 'bow', quiver: true, tilak: 'v', orn: 2, aura: '#9fd0ff' },
  'rama.prince': { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'crown', dhoti: '#f2b632', uttariya: '#d8572a', weapon: 'bow', quiver: true, tilak: 'v', orn: 3, aura: '#9fd0ff' },
  'rama.king': { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'crown', dhoti: '#f5c03a', uttariya: '#b8202a', weapon: 'none', tilak: 'v', orn: 3, aura: '#ffe6a0' },
  'rama.exile': { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'jata', valkala: true, weapon: 'bow', quiver: true, tilak: 'v', orn: 0, aura: '#9fd0ff' },
  lakshmana:   { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'jata', dhoti: '#e8902a', uttariya: '#c8502a', weapon: 'bow', quiver: true, tilak: 'v', orn: 2 },
  'lakshmana.prince': { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'crown', dhoti: '#f0a030', uttariya: '#a83a2a', weapon: 'bow', quiver: true, tilak: 'v', orn: 3 },
  bharata: { kind: 'human', sex: 'm', skin: '#5f7896', head: 'crown', dhoti: '#e8902a', uttariya: '#c8502a', weapon: 'bow', quiver: true, tilak: 'v', orn: 3 },
  'bharata.ascetic': { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'jata', valkala: true, weapon: 'none', tilak: 'v', orn: 0 },
  shatrughna: { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'crown', dhoti: '#c8902a', uttariya: '#8a3a1a', weapon: 'bow', quiver: true, tilak: 'v', orn: 3 },
  dasharatha: { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'crown', beard: 'grey', dhoti: '#e89a2a', uttariya: '#9a1a2a', weapon: 'sword', armor: true, orn: 3, scale: 1.02 },
  kausalya: { kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'crown-f', saree: '#a8202a', pallu: '#d8a040', orn: 3, older: true },
  kaikeyi: { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'crown-f', saree: '#6a2a7a', pallu: '#d8a040', orn: 3 },
  sumitra: { kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'crown-f', saree: '#2a4a8a', pallu: '#d8b060', orn: 3, older: true },
  manthara: { kind: 'human', sex: 'f', skin: SKIN.dusky, head: 'bun-f', saree: '#3a3a40', pallu: '#5a5a60', weapon: 'staff', orn: 0, hunch: true, older: true },
  sumantra: { kind: 'human', sex: 'm', skin: SKIN.dusky, head: 'band', beard: 'grey', dhoti: '#e0d0b0', uttariya: '#8a6a3a', armor: true, weapon: 'scroll', orn: 1 },
  guha:        { kind: 'human', sex: 'm', skin: SKIN.deep, head: 'band', beard: 'moustache', dhoti: '#6a4a2a', uttariya: '#3a5a3a', weapon: 'bow', orn: 1 },
  lava: { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'jata', dhoti: '#f0b030', uttariya: '#d86a1a', weapon: 'bow', quiver: true, orn: 0, scale: .74 },
  kusha: { kind: 'human', sex: 'm', skin: SKIN.rama, head: 'jata', dhoti: '#e07a2a', uttariya: '#a83a1a', weapon: 'bow', quiver: true, orn: 0, scale: .78 },

  // ── Mithila ──
  sita:        { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'bun-f', saree: '#f0a020', pallu: '#d86a1a', orn: 3, aura: '#ffe0a0' },
  'sita.bride': { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'crown-f', saree: '#c8202a', pallu: '#f0b030', orn: 3, aura: '#ffe0a0' },
  'sita.captive': { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'bun-f', saree: '#d8b050', pallu: '#b89040', orn: 0, aura: '#ffe0a0' },
  urmila: { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'crown-f', saree: '#c8501a', pallu: '#e8a030', orn: 3 },
  mandavi: { kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'crown-f', saree: '#d8a030', pallu: '#a86a1a', orn: 3 },
  shrutakirti: { kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'crown-f', saree: '#b8202a', pallu: '#e0b050', orn: 3 },
  janaka: { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'crown', beard: 'white', dhoti: '#f0e8d4', uttariya: '#d8902a', weapon: 'sword', orn: 2 },

  // ── Rishis ──
  valmiki: { kind: 'human', sex: 'm', skin: SKIN.dusky, head: 'sage', beard: 'white', dhoti: '#e0702a', uttariya: '#c8541a', weapon: 'scroll', tilak: 't', orn: 0 },
  narada: { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'jata', beard: 'none', dhoti: '#e8802a', uttariya: '#f0b040', weapon: 'veena', tilak: 'v', orn: 1, aura: '#ffffff' },
  vasishtha: { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'sage', beard: 'white', dhoti: '#e8702a', uttariya: '#c8541a', weapon: 'staff', tilak: 't', orn: 0, aura: '#fff2c0' },
  vishwamitra: { kind: 'human', sex: 'm', skin: SKIN.deep, head: 'jata', beard: 'black', dhoti: '#e0a030', uttariya: '#c8641a', weapon: 'kamandalu', tilak: 't', orn: 0, aura: '#ffc070' },
  parashurama: { kind: 'human', sex: 'm', skin: SKIN.deep, head: 'jata', beard: 'black', dhoti: '#8a3a1a', uttariya: '#5a2a14', weapon: 'axe', tilak: 't', orn: 0, scale: 1.1, aura: '#ff7a3a' },
  agastya: { kind: 'human', sex: 'm', skin: SKIN.deep, head: 'sage', beard: 'white', dhoti: '#c8702a', uttariya: '#a8541a', weapon: 'kamandalu', tilak: 't', orn: 0, scale: .92, aura: '#fff2c0' },
  bharadwaja:  { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'sage', beard: 'white', valkala: true, weapon: 'staff', tilak: 't', orn: 0 },
  atri:        { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'sage', beard: 'white', valkala: true, weapon: 'kamandalu', tilak: 't', orn: 0 },
  anasuya:     { kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'sage-f', saree: '#e8dcc0', pallu: '#c89a50', orn: 0, older: true, aura: '#fff2c0' },
  ahalya:      { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'bun-f', saree: '#e8e0d0', pallu: '#c0b090', orn: 1, aura: '#ffffff' },
  rishyasringa:{ kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'sage', beard: 'none', valkala: true, weapon: 'kamandalu', tilak: 't', orn: 0 },
  shabari: { kind: 'human', sex: 'f', skin: SKIN.deep, head: 'sage-f', saree: '#c8903a', pallu: '#a8702a', weapon: 'basket', orn: 0, older: true },
  durvasa:     { kind: 'human', sex: 'm', skin: SKIN.dusky, head: 'sage', beard: 'grey', valkala: true, weapon: 'staff', tilak: 't', orn: 0, aura: '#ff6a3a' },
  kala:        { kind: 'human', sex: 'm', skin: '#3a3a4a', head: 'sage', beard: 'black', dhoti: '#1a1a2a', uttariya: '#3a3a5a', weapon: 'staff', orn: 0, aura: '#8a8aff' },
  bhadra:      { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'band', beard: 'moustache', dhoti: '#d0c0a0', uttariya: '#5a6a7a', weapon: 'none', orn: 1 },

  // ── Divine ──
  vishnu:      { kind: 'human', sex: 'm', skin: SKIN.blue, head: 'crown', dhoti: '#f4c020', uttariya: '#f08a20', weapon: 'chakra', arms: 4, tilak: 'v', orn: 3, aura: '#ffe680', scale: 1.1 },
  shiva:       { kind: 'human', sex: 'm', skin: SKIN.ash, head: 'shiva', dhoti: '#c8a070', tiger: true, uttariya: null, weapon: 'trident', tilak: 't', orn: 1, aura: '#bfe0ff', scale: 1.1 },
  brahma:      { kind: 'human', sex: 'm', skin: '#e0a060', head: 'crown', beard: 'white', heads: 4, dhoti: '#f0e0b0', uttariya: '#d84a2a', weapon: 'kamandalu', arms: 4, orn: 3, aura: '#ffd080', scale: 1.08 },
  indra:       { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'crown', beard: 'moustache', dhoti: '#f0c040', uttariya: '#2a5ab0', weapon: 'vajra', orn: 3, aura: '#c0e0ff' },
  agni:        { kind: 'human', sex: 'm', skin: SKIN.red, head: 'flame', beard: 'black', dhoti: '#f0c030', uttariya: '#e0401a', weapon: 'none', orn: 2, aura: '#ff8a3a' },
  vayu:        { kind: 'human', sex: 'm', skin: '#a8c8e0', head: 'crown', dhoti: '#e0f0ff', uttariya: '#8ab0e0', weapon: 'none', orn: 2, aura: '#d0f0ff' },
  surya:       { kind: 'human', sex: 'm', skin: '#f0b040', head: 'crown', dhoti: '#f0e070', uttariya: '#ff7a1a', weapon: 'lotus', orn: 3, aura: '#ffd040', scale: 1.05 },
  kubera:      { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'crown', beard: 'moustache', dhoti: '#f0d060', uttariya: '#2a8a5a', weapon: 'mace', orn: 3, scale: 1.05 },
  samudra:     { kind: 'human', sex: 'm', skin: '#3a8a9a', head: 'crown', beard: 'black', dhoti: '#2a6a8a', uttariya: '#8ad0e0', weapon: 'none', orn: 3, aura: '#8af0ff', scale: 1.15 },
  bhudevi:     { kind: 'human', sex: 'f', skin: '#c89a5a', head: 'crown-f', saree: '#2a7a3a', pallu: '#d8b040', orn: 3, aura: '#c0ffb0', scale: 1.08 },
  saraswati:   { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'crown-f', saree: '#f8f4e8', pallu: '#d8c080', weapon: 'veena', orn: 2, aura: '#ffffff' },
  nandi:       { kind: 'vanara', fur: '#d8d0c0', face: '#e8d8c8', head: 'band', dhoti: '#e0e0e0', weapon: 'trident', orn: 1 },
  matali:      { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'band', beard: 'moustache', dhoti: '#f0d070', uttariya: '#3a6ab0', weapon: 'none', orn: 2 },
  garuda: { kind: 'human', sex: 'm', skin: '#d8a050', head: 'eagle', wings: '#b8742a', dhoti: '#e8b030', uttariya: '#c8401a', armor: true, weapon: 'none', orn: 3, scale: 1.15, aura: '#ffd060' },
  vedavati:    { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'sage-f', saree: '#f0e8d8', pallu: '#d8b070', orn: 0, aura: '#ffb070' },
  rambha:      { kind: 'human', sex: 'f', skin: SKIN.fair, head: 'crown-f', saree: '#e05aa0', pallu: '#f0c060', orn: 3 },
  nalakubara:  { kind: 'human', sex: 'm', skin: SKIN.fair, head: 'crown', dhoti: '#f0d060', uttariya: '#2a8a5a', weapon: 'none', orn: 3 },
  kartavirya:  { kind: 'human', sex: 'm', skin: SKIN.wheat, head: 'crown', beard: 'moustache', dhoti: '#f0c040', uttariya: '#8a2a2a', weapon: 'mace', arms: 4, orn: 3, scale: 1.12 },

  // ── Vanaras & allies ──
  hanuman:     { kind: 'vanara', fur: '#c88a3a', face: '#e88a5a', head: 'band', dhoti: '#e8722a', weapon: 'mace', orn: 2, scale: 1.08, aura: '#ffb040', tilak: 'h' },
  sugriva: { kind: 'vanara', fur: '#d8a030', face: '#e8b07a', head: 'crown', dhoti: '#b8202a', weapon: 'mace', orn: 3 },
  vali: { kind: 'vanara', fur: '#c8902a', face: '#e0a870', head: 'crown', dhoti: '#a81a2a', weapon: 'mace', armor: true, orn: 3, scale: 1.14 },
  angada: { kind: 'vanara', fur: '#d0a040', face: '#e8b07a', head: 'crown', dhoti: '#6a2a7a', weapon: 'mace', armor: true, orn: 3 },
  tara: { kind: 'vanara', sex: 'f', fur: '#c89a50', face: '#f0c09a', head: 'crown-f', saree: '#8a1a2a', pallu: '#d8a040', orn: 3 },
  nala: { kind: 'vanara', fur: '#8a6a3a', face: '#c88a6a', head: 'band', dhoti: '#8a5a2a', weapon: 'block', orn: 1 },
  nila: { kind: 'vanara', fur: '#2a2c3a', face: '#6a6a7a', head: 'band', dhoti: '#c8962a', weapon: 'mace', orn: 1, aura: '#ff6a2a' },
  sushena: { kind: 'vanara', fur: '#8a8070', face: '#c8b098', head: 'band', beard: 'white', dhoti: '#a8905a', weapon: 'herb', orn: 1 },
  jambavan: { kind: 'bear', fur: '#2a2228', face: '#5a4a48', head: 'crown', dhoti: '#5a2a1a', weapon: 'mace', armor: true, orn: 2, scale: 1.15 },
  jatayu:      { kind: 'bird', body: '#6a5040', wing: '#4a3a30', head: '#d8c8b0', beak: '#e8c060', scale: 1.5, ruff: '#f0e8d8' },
  sampati:     { kind: 'bird', body: '#5a4838', wing: '#3a2a22', head: '#c8b8a0', beak: '#d8b050', scale: 1.6, ruff: '#e8dcc8', wingless: true },
  swayamprabha:{ kind: 'human', sex: 'f', skin: SKIN.wheat, head: 'sage-f', saree: '#e8d8b0', pallu: '#b89040', orn: 0, aura: '#ffd080' },

  // ── Rakshasas ──
  ravana:      { kind: 'human', sex: 'm', skin: '#6a4a3a', head: 'rakshasa', heads: 10, crown: 'spiky', beard: 'moustache', dhoti: '#5a1020', uttariya: '#a01a2a', weapon: 'sword', armor: true, orn: 3, scale: 1.18, aura: '#ff3a2a' },
  'ravana.mendicant': { kind: 'human', sex: 'm', skin: '#8a5a3a', head: 'sage', beard: 'black', dhoti: '#c8602a', uttariya: '#a04a1a', weapon: 'kamandalu', orn: 0 },
  kumbhakarna: { kind: 'human', sex: 'm', skin: '#5a4a5a', head: 'rakshasa', crown: 'spiky', beard: 'moustache', fangs: true, dhoti: '#3a2a4a', uttariya: '#6a1a2a', weapon: 'spear', armor: true, orn: 2, scale: 2.1 },
  vibhishana: { kind: 'human', sex: 'm', skin: '#7a5a4a', head: 'crown', beard: 'moustache', dhoti: '#c8401a', uttariya: '#8a1a1a', weapon: 'sword', tilak: 'v', orn: 2 },
  indrajit:    { kind: 'human', sex: 'm', skin: '#5a4a5a', head: 'rakshasa', crown: 'spiky', beard: 'moustache', dhoti: '#2a2a4a', uttariya: '#4a1a5a', weapon: 'bow', quiver: true, armor: true, orn: 3, scale: 1.08, aura: '#9a5aff' },
  mandodari: { kind: 'human', sex: 'f', skin: '#b8805a', head: 'crown-f', saree: '#5a0a1a', pallu: '#c89a3a', orn: 3 },
  shurpanakha: { kind: 'human', sex: 'f', skin: '#6a5a4a', head: 'rakshasi', saree: '#3a5a2a', pallu: '#8a2a2a', orn: 2, fangs: true },
  mareecha:    { kind: 'human', sex: 'm', skin: '#5a4a3a', head: 'rakshasa', beard: 'moustache', fangs: true, dhoti: '#4a3a2a', uttariya: '#6a4a2a', weapon: 'sword', orn: 1 },
  'mareecha.deer': { kind: 'deer', body: '#e8b830', spots: '#f8f0e0', antler: '#4a7ab0', scale: 1 },
  subahu:      { kind: 'human', sex: 'm', skin: '#4a3a4a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#3a1a1a', uttariya: '#5a2a1a', weapon: 'spear', orn: 1, scale: 1.08 },
  tataka:      { kind: 'human', sex: 'f', skin: '#5a3a3a', head: 'rakshasi', fangs: true, saree: '#3a2a1a', pallu: '#5a1a1a', orn: 1, scale: 1.45 },
  kaikesi:     { kind: 'human', sex: 'f', skin: '#8a6a5a', head: 'crown-f', saree: '#4a1a3a', pallu: '#c89a3a', orn: 2 },
  sumali:      { kind: 'human', sex: 'm', skin: '#5a4a4a', head: 'rakshasa', crown: 'spiky', beard: 'grey', dhoti: '#3a2a2a', uttariya: '#6a3a1a', weapon: 'mace', orn: 2 },
  khara:       { kind: 'human', sex: 'm', skin: '#4a3a3a', head: 'rakshasa', crown: 'spiky', beard: 'moustache', fangs: true, dhoti: '#2a1a1a', uttariya: '#8a1a1a', weapon: 'mace', armor: true, orn: 2, scale: 1.15 },
  dushana:     { kind: 'human', sex: 'm', skin: '#3a3a4a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#1a1a2a', uttariya: '#5a1a3a', weapon: 'sword', armor: true, orn: 1, scale: 1.1 },
  akampana:    { kind: 'human', sex: 'm', skin: '#4a4a3a', head: 'rakshasa', fangs: true, dhoti: '#2a2a1a', uttariya: '#5a3a1a', weapon: 'spear', orn: 1 },
  prahasta:    { kind: 'human', sex: 'm', skin: '#4a3a3a', head: 'rakshasa', crown: 'spiky', beard: 'moustache', fangs: true, dhoti: '#2a1a1a', uttariya: '#7a2a1a', weapon: 'mace', armor: true, orn: 2, scale: 1.15 },
  atikaya:     { kind: 'human', sex: 'm', skin: '#4a4a5a', head: 'rakshasa', crown: 'spiky', fangs: true, dhoti: '#1a2a3a', uttariya: '#3a1a4a', weapon: 'bow', armor: true, orn: 2, scale: 1.6 },
  akshakumara: { kind: 'human', sex: 'm', skin: '#6a5a5a', head: 'crown', dhoti: '#4a1a2a', uttariya: '#a02a3a', weapon: 'bow', armor: true, orn: 3, scale: .92 },
  trijata:     { kind: 'human', sex: 'f', skin: '#6a5a5a', head: 'rakshasi', saree: '#4a4a5a', pallu: '#6a5a6a', orn: 1, older: true },
  viradha:     { kind: 'human', sex: 'm', skin: '#3a3a2a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#2a2a1a', uttariya: '#4a3a1a', weapon: 'spear', orn: 0, scale: 1.55 },
  kabandha:    { kind: 'kabandha', skin: '#4a3a3a', scale: 1.7 },
  lankini:     { kind: 'human', sex: 'f', skin: '#7a5a3a', head: 'crown-f', saree: '#6a1a1a', pallu: '#c89a3a', weapon: 'spear', armor: true, orn: 2, scale: 1.3 },
  surasa:      { kind: 'serpent', body: '#3a7a5a', hood: '#2a5a4a', scale: 2.2 },
  simhika:     { kind: 'human', sex: 'f', skin: '#2a2a3a', head: 'rakshasi', fangs: true, saree: '#1a1a2a', pallu: '#3a2a4a', orn: 0, scale: 1.8 },
  vidyujjihva: { kind: 'human', sex: 'm', skin: '#4a3a5a', head: 'rakshasa', fangs: true, dhoti: '#2a1a3a', uttariya: '#4a2a5a', weapon: 'none', orn: 1 },
  'shuka-sarana': { kind: 'human', sex: 'm', skin: '#5a4a4a', head: 'rakshasa', dhoti: '#3a3a2a', uttariya: '#5a4a2a', weapon: 'none', orn: 1 },
  lavanasura:  { kind: 'human', sex: 'm', skin: '#3a4a3a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#1a2a1a', uttariya: '#3a1a1a', weapon: 'trident', orn: 1, scale: 1.3 },
  mayavi:      { kind: 'human', sex: 'm', skin: '#3a2a3a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#1a1a1a', uttariya: '#3a1a2a', weapon: 'sword', orn: 1, scale: 1.2 },
  dundubhi:    { kind: 'bear', fur: '#2a2a2a', face: '#4a3a3a', head: 'band', horns: true, dhoti: '#1a1a1a', weapon: 'none', orn: 0, scale: 1.8 },
  kakasura:    { kind: 'crow' },
  // ── Variants & ensemble figures used on the stage ──
  'dasharatha.young': { kind: 'human', sex: 'm', skin: '#d29b6c', head: 'crown', beard: 'moustache', dhoti: '#f0c040', uttariya: '#8a1a2a', weapon: 'bow', quiver: true, orn: 2 },
  'vishwamitra.king': { kind: 'human', sex: 'm', skin: '#a8714a', head: 'crown', beard: 'black', dhoti: '#c8402a', uttariya: '#7a2a1a', weapon: 'sword', armor: true, orn: 3 },
  'hanuman.mendicant': { kind: 'human', sex: 'm', skin: '#c88a5a', head: 'sage', beard: 'none', valkala: true, weapon: 'staff', tilak: 't', orn: 0 },
  yajnapurusha: { kind: 'human', sex: 'm', skin: '#4a2a3a', head: 'crown', dhoti: '#c8202a', uttariya: '#7a0a1a', weapon: 'none', orn: 3, aura: '#ff9a3a', scale: 1.15 },
  gandharva:   { kind: 'human', sex: 'm', skin: '#e2c09a', head: 'crown', dhoti: '#f0f0ff', uttariya: '#8ab0e0', weapon: 'none', orn: 2, aura: '#d0e8ff' },
  citizen:     { kind: 'human', sex: 'm', skin: '#c08a5a', head: 'band', beard: 'moustache', dhoti: '#f0e8d0', uttariya: '#3a7a8a', weapon: 'none', orn: 1, scale: .92 },
  citizenf:    { kind: 'human', sex: 'f', skin: '#c8946a', head: 'bun-f', saree: '#2a8a6a', pallu: '#e0b040', orn: 1, scale: .9 },
  priest:      { kind: 'human', sex: 'm', skin: '#d29b6c', head: 'sage', beard: 'grey', dhoti: '#f8f0e0', uttariya: '#e0902a', weapon: 'kamandalu', tilak: 't', orn: 0 },
  soldier:     { kind: 'human', sex: 'm', skin: '#a8714a', head: 'band', beard: 'moustache', dhoti: '#c8a050', uttariya: '#8a2a1a', weapon: 'spear', armor: true, orn: 1 },
  sage:        { kind: 'human', sex: 'm', skin: '#b8865a', head: 'sage', beard: 'white', valkala: true, weapon: 'staff', tilak: 't', orn: 0, aura: '#fff2c0' },
  hunter:      { kind: 'human', sex: 'm', skin: '#7a4a32', head: 'band', beard: 'black', dhoti: '#5a3a1a', uttariya: '#3a2a1a', weapon: 'bow', quiver: true, orn: 0 },
  muniboy:     { kind: 'human', sex: 'm', skin: '#c8946a', head: 'jata', valkala: true, weapon: 'kamandalu', orn: 0, scale: .8 },
  vanara:      { kind: 'vanara', fur: '#a8783a', face: '#d09a70', head: 'band', dhoti: '#8a4a2a', weapon: 'none', orn: 0 },
  rakshasa:    { kind: 'human', sex: 'm', skin: '#4a3a3a', head: 'rakshasa', fangs: true, horns: true, dhoti: '#2a1a1a', uttariya: '#5a1a1a', weapon: 'spear', armor: true, orn: 1, scale: 1.05 },
  rakshasi:    { kind: 'human', sex: 'f', skin: '#5a4a4a', head: 'rakshasi', fangs: true, saree: '#3a2a3a', pallu: '#5a1a2a', weapon: 'spear', orn: 1, scale: 1.1 },
  krauncha:    { kind: 'bird', body: '#d8d8e2', wing: '#a8a8bc', head: '#ececf2', beak: '#4a4a4a', ruff: '#f0f0f6', crestRed: true, scale: .42 },
  mainaka:     { kind: 'human', sex: 'm', skin: '#6a7a5a', head: 'crown', beard: 'moustache', dhoti: '#5a6a4a', uttariya: '#8a9a6a', weapon: 'none', orn: 2, aura: '#c0ffc0' }
};

// Which costume a character wears by default in each Kāṇḍa.
export const VARIANT_BY_BOOK = {
  bala: { rama: 'rama.prince', lakshmana: 'lakshmana.prince' },
  ayodhya: { rama: 'rama.prince', lakshmana: 'lakshmana.prince' },
  uttara: { rama: 'rama.king' }
};
