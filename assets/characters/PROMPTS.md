# Character, background and scene art

The site shows your 3D character art everywhere: cards, profiles, the stage beside the book, the battle and the Dharma Yuddha game. How sharp a character looks depends only on the resolution of the art it was cut from.

All 62 characters now come from full-resolution Gemini renders, except **Śrutakīrti** (still from a contact sheet). Rāvaṇa uses the corrected ten-headed front view; his disguise as a mendicant (`ravana.mendicant`) has its own art.

## Background plates (the biggest visual upgrade)

The cinematic look of AI-rendered retellings comes from their painted backgrounds. The stage supports the same:

1. Open **`tools/prompts.html`** → **Backgrounds**. There is a prompt for each of the 32 settings of the story (ordered by how often they appear), plus 16 optional time-of-day variants.
2. Generate each in Gemini (16:9). Keep the rules in the prompt: **empty scene, eye-level camera, open ground in the lower third, sharp focus everywhere.**
3. Save as `assets/backgrounds/incoming/<name>.png` (for example `court.png`, `battle-night.png`).
4. Run `node tools/build-backgrounds.mjs` (or ask Claude). It removes the Gemini sparkle, estimates depth with Depth Anything V2, and measures the plate's light.

The stage then rebuilds each plate as a 3D surface from its depth, so the camera dollies and arcs through it with real parallax. The characters stand on its ground, take its key light and rim light, and cast shadows onto it. Light shafts and mist drift through it. A setting without a plate keeps its real-time 3D scene.

## Getting sharp, cinematic characters (like the Divya Katha videos)

1. Open **`tools/prompts.html`** on the local site (`http://localhost:5173/tools/prompts.html`). It has a copy-ready prompt for every character, written in the cinematic 3D style of that channel, plus exact filenames.
2. Generate **one character per image** at full resolution, either a 4-view turnaround sheet or a single full-body image. Never put several characters on one sheet.
3. Save it as `assets/characters/incoming/<id>.png` (for example `incoming/dasharatha.png`). Separate views also work: `incoming/<id>-front.png`, `-left`, `-right`, `-back`.
4. Run `node tools/build-characters.mjs`, or ask Claude to import the art. Backgrounds are removed automatically, and the new art replaces the old everywhere.

### Rāvaṇa must have exactly ten heads

The prompt says it explicitly: one central crowned head, five to its left, four to its right (5 + 1 + 4 = 10). **Count the heads on every view before importing.** The original render had nine; the front view on the site was corrected to ten, and the old views are kept in `assets/characters/originals/`.

### Sītā

Her prompt asks for a serene, loving expression, a saffron-yellow silk saree draped over her head, delicate gold jewellery, a soft halo, and a graceful posture with one hand raised in blessing. For a seated portrait, as in classical paintings, add: *"seated gracefully on a stone beneath a flowering aśoka tree"*.

## Animated clips, for real character motion (optional, per paragraph)

Cut-out characters can breathe, walk, turn, gesture and be filmed, but they cannot *act*: limbs, faces and cloth in motion. In AI-made retellings that motion comes from video generation. You can add it paragraph by paragraph:

1. In Gemini, use **Veo** (video). Give it the setting's background plate and the characters' images as references, and describe the moment. The **Scenes** tab of `tools/prompts.html` has a ready description for each of the 296 paragraphs.
2. Save the clip as `assets/scenes/<key>.mp4` (the key is shown with each prompt, for example `ayodhya-0-0.mp4`). A still image (`.jpg`, `.png`, `.webp`) also works.
3. Run `node tools/register-scenes.mjs`.

The stage plays the clip in place of the real-time scene, looped and silent, with the narration, subtitles in the reader's language, the chapter card, dialogue and sound. Start with the moments that matter most: the breaking of Śiva's bow, the exile, the golden deer, Jaṭāyu's fight, Hanumān's leap, the burning of Laṅkā and the final duel.
