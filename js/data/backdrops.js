// Cinematic background plates: one per setting of the story (an optional extra plate per time of day).
// Generate each with the prompt below (tools/prompts.html → Backgrounds), save it as
// assets/backgrounds/incoming/<id>.png  (or <id>-<time>.png for a time-of-day variant)
// and run  node tools/build-backgrounds.mjs  — the stage then films the story inside it, with real parallax.

export const PLATE_STYLE = 'Cinematic background plate for a 3D-animated devotional film of the Vālmīki Rāmāyaṇa, ultra-detailed photorealistic Unreal Engine 5 render in the style of modern AI-generated Indian mythological epics (rich colour, volumetric light, atmospheric haze, divine and majestic mood)';
export const PLATE_RULES = 'Wide establishing shot from human eye level (camera about 1.6 m above the ground, looking straight ahead, horizon a little above the middle of the frame), 16:9 landscape. The scene is completely EMPTY: no people, no gods, no animals, no characters of any kind. The lower third of the frame is open, level, walkable ground in clear view, with nothing blocking the centre, so actors can be placed standing on it. Clear layers of depth: foreground ground detail, midground set pieces, distant background. Sharp focus everywhere (no depth-of-field blur, no motion blur). No text, no watermark, no border.';
export const PLATE_RULES_AIR = 'Wide cinematic shot, 16:9 landscape. The scene is completely EMPTY: no people, no gods, no animals, no characters. Sharp focus everywhere, no text, no watermark, no border.';

export const TIME_TEXT = {
  day: 'in clear bright daylight, sun high and to one side, crisp shadows',
  dawn: 'at dawn, soft pink and gold sunrise light, long gentle shadows, morning mist',
  dusk: 'at dusk, warm orange and crimson sunset light, long shadows, glowing sky',
  night: 'at night, cool blue moonlight with warm lamplight and firelight, deep shadows, stars',
  war: 'under a smoke-filled blood-red sky, fires burning, embers drifting',
  gold: 'in radiant golden divine light',
  storm: 'in a raging storm, dark clouds, rain and lightning, wind-blown',
  cosmic: 'in deep space light, glowing nebulae'
};

// id → [default time, description, air view (no ground)?]
export const BACKDROPS = {
  // the open battlefield before the temples, from the reference film (~/Downloads/astra.mp4): the Dharma Yuddha arena
  field: ['gold', 'the wide trampled battlefield before the tall carved temple spires of Laṅkā, smoke drifting, golden evening light breaking through dark clouds'],
  court: ['day', 'the great royal assembly hall (rāja-sabhā) of Ayodhyā: two rows of tall carved golden pillars receding toward a jewelled lion throne on a raised dais at the far end, a polished marble floor with a long crimson carpet down the middle, silk canopies, incense smoke, sunbeams slanting through high latticed windows'],
  battle: ['war', 'the great battlefield before the golden ramparts of Laṅkā: a vast trampled plain of dust with broken chariot wheels, scattered spears and arrows, small fires burning, thick smoke drifting, the gigantic golden walls and towers of Laṅkā on the horizon'],
  'lanka-court': ['night', 'Rāvaṇa’s awe-inspiring council hall in Laṅkā: colossal black-stone and gold pillars carved with fierce faces, braziers of roaring fire, a crystal-and-gold throne on a high dais at the back, red and gold banners, a dark polished floor reflecting the firelight, menacing yet magnificent'],
  ashram: ['dawn', 'a serene forest hermitage (āśrama) of a great sage: thatched huts with leaf roofs, a small brick fire altar with a thin column of smoke, a sacred tulasī shrine, clay pots and kuśa-grass mats, a clean-swept earthen courtyard in the foreground, tall trees all around'],
  rocks: ['day', 'the rocky hills of Kiṣkindhā (a Hampi-like landscape): enormous rounded granite boulders piled into hills, dry golden grass, a few palms and banana trees, open rocky ground in the foreground'],
  palace: ['day', 'a sumptuous inner hall of the royal palace of Ayodhyā: carved sandstone and marble pillars inlaid with gold, silk curtains in saffron and crimson, brass oil lamps, a lotus-patterned marble floor, soft sunlight through latticed jālī windows'],
  ayodhya: ['day', 'the golden capital Ayodhyā on the Sarayū: a broad royal avenue paved with stone leading to a magnificent palace complex of white marble and gold, tall carved temple towers and gilded domes, saffron banners fluttering, garlands and flower petals strewn on the road, mango and aśoka trees'],
  ashoka: ['night', 'the Aśoka grove (Aśoka-vāṭikā) in Laṅkā: red-flowering aśoka trees, a great śiṃśapā tree with a low stone platform beneath it, moonlight filtering through leaves, drifting mist, fireflies, golden palace roofs glowing far behind'],
  shore: ['dusk', 'the shore of the southern ocean below Mount Mahendra: wide white sand in the foreground, coconut palms bending in the wind, great waves breaking on dark rocks, the endless ocean stretching to the horizon'],
  panchavati: ['day', 'Pañcavaṭī on the bank of the Godāvarī: a beautiful leaf hut (parṇaśālā) surrounded by five great banyan trees, flowering creepers, a clear stream, a swept clearing in front of the hut'],
  river: ['day', 'a tranquil river bank in an ancient Indian forest: clear water over smooth stones, reeds and lotus, tall trees leaning over the water, a sandy bank in the foreground'],
  kishkindha: ['day', 'the vānara capital Kiṣkindhā: a great cave-city carved into a mountain of boulders, a towering golden gateway with carved pillars, fruit orchards and flowering trees, banners on the rocks'],
  forest: ['day', 'a dense, lush ancient Indian forest: towering sal and banyan trees with hanging roots, ferns and flowering shrubs, shafts of sunlight piercing the canopy, a mossy natural clearing in the foreground'],
  heaven: ['gold', 'Svarga, the realm of the gods: golden palaces and pavilions resting on luminous clouds, celestial gardens with pārijāta trees, a floor of soft glowing cloud in the foreground'],
  chamber: ['night', 'a royal bedchamber in the palace of Ayodhyā at night: a carved bed with silk drapes at the back, brass oil lamps glowing warmly, rich carpets on the floor, deep shadows, moonlight through a latticed window'],
  dandaka: ['dusk', 'the deep primeval Daṇḍaka forest: giant gnarled trees, thick mist between the trunks, dark green and amber tones, fireflies, an eerie and mysterious atmosphere, a small clearing of earth and fallen leaves in the foreground'],
  lanka: ['night', 'the golden city of Laṅkā on Mount Trikūṭa: towering palaces of gold and jewels glowing with countless lamps, great ramparts and gates, the dark ocean below, moonlit clouds, seen from a terrace with open paving in the foreground'],
  yajna: ['dawn', 'a sacred Vedic fire altar (yajña-kuṇḍa) of brick in a forest clearing, carved sacrificial posts (yūpa), kuśa-grass mats, flower offerings and pots of ghee, fragrant smoke rising into slanting light'],
  himalaya: ['night', 'the snow-covered Himālaya: moonlit peaks and glaciers, a high snowy valley with open snow in the foreground, a starry sky'],
  cave: ['night', 'a vast mysterious cavern: glowing golden crystals, still pools reflecting the light, trees with jewel-like fruits growing inside, mist, warm magical light, an open cave floor in the foreground'],
  naimisha: ['day', 'the sacred Naimiṣa forest: a grand open pavilion (yajña-maṇḍapa) of carved wooden pillars hung with garlands for the Aśvamedha sacrifice, fire altars, rows of empty kuśa-grass mats, tall forest trees around'],
  ocean: ['day', 'the open southern ocean seen from high above in flight: rolling waves, sunlit towering clouds, the horizon far away', true],
  chitrakoot: ['day', 'Citrakūṭa hill: green wooded slopes, a waterfall falling into the Mandākinī river, a simple leaf hut on a grassy ledge, flowering trees, open grass in the foreground'],
  'lanka-street': ['night', 'a grand street in Laṅkā: golden mansions with jewelled balconies, burning torches, crimson banners, a paved road in the foreground, the glow of fire and moonlight'],
  kailasa: ['dusk', 'Mount Kailāsa: a majestic snow peak glowing in the golden light of dusk, the sacred lake Mānasarovara below, open snowy ground in the foreground, a stillness like prayer'],
  ganga: ['dawn', 'the vast holy Gaṅgā: a wide river of shimmering water veiled in mist, a sandy bank in the foreground with a wooden boat moored, the forested far shore'],
  cosmic: ['cosmic', 'the cosmic ocean of milk (Kṣīra-sāgara) among stars and nebulae: a luminous milky ocean beneath galaxies, deep blue and violet space', true],
  sky: ['day', 'high above the world, a sea of sunlit clouds, sky in gold and blue', true],
  pampa: ['day', 'Lake Pampā: a vast clear lake covered with pink and blue lotuses, huge rounded granite boulders, flowering trees on the shore, the Ṛṣyamūka hills beyond, a grassy shore in the foreground'],
  sarayu: ['dusk', 'the stone ghāṭs of the Sarayū river at Ayodhyā: wide steps descending to the water, floating oil lamps, temples on the bank, the warm orange sky reflected in the river'],
  mithila: ['day', 'the festive city of Mithilā: sandstone palaces with carved balconies, colourful banners and flower garlands, a royal pavilion for the svayaṃvara, a wide stone-paved courtyard in the foreground'],
  setu: ['day', 'the great stone bridge Rāma Setu stretching across the ocean to the horizon, built of floating rocks, waves on both sides, seen from the bridge itself']
};
// time-of-day plates that matter most to the story (the others are graded from the main plate)
export const PLATE_VARIANTS = ['battle-night', 'battle-dusk', 'ashram-day', 'ashram-night', 'ayodhya-dusk', 'rocks-dusk', 'river-night', 'river-dawn', 'forest-dusk', 'forest-night', 'ashoka-day', 'lanka-day', 'shore-day', 'dandaka-night', 'palace-night', 'kishkindha-dusk'];

export function platePrompt(id, time) {
  const [t0, desc, air] = BACKDROPS[id];
  return `${PLATE_STYLE}: ${desc}, ${TIME_TEXT[time || t0] || ''}. ${air ? PLATE_RULES_AIR : PLATE_RULES}`;
}
