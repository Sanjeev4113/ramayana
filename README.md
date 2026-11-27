# The Rāmāyaṇa — a living book

**Live:** https://ramayana-lime.vercel.app

Śrīmad Vālmīki Rāmāyaṇa as a website you read, watch and play. The whole kathā, from Vālmīki's question to Rāma's departure, is told as one flowing story in seven Kāṇḍas, and every sentence has its own painting and narration.

## What you will find

- **The book.** 244 passages, each turning like the leaf of a bound book, with the painting of the sentence being read on the left page and the text on the right. On a phone the page turns over by its edge. Read Along narrates it in English, हिन्दी, Hindi (Roman), తెలుగు, தமிழ், ಕನ್ನಡ, മലയാളം and मराठी, lighting each sentence as it is spoken.
- **The opening and the Glimpse.** A short film opens the site and hands over to the live page laid out exactly on its last frame; a ten-second glimpse of the saga plays beneath the opening verse.
- **The Pantheon.** The figures of the epic on a turning pedestal, with lineage, weapons and the episodes they appear in.
- **The Journey.** The land from the Himālaya to Laṅkā (NASA Blue Marble), with every journey of the epic drawn as a road of light.
- **The Rāmāyaṇa Today.** The places of the epic as they are now (Ayodhya, Janakpur, Chitrakoot, Nashik, Lepakshi, Hampi, Rameswaram, Sri Lanka), the festivals of the year, its tellings across the world and the words it left in our languages.
- **Laṅkā Yuddha.**
  - *The Divine Astras*: Brahmāstra, Āgneyāstra, Aindrāstra and Nāga-pāśa loosed as light across the battlefield.
  - *The Great Duels*: eleven duels from Tāṭakā to Rāvaṇa, each staged in its own place and acted out round by round as Vālmīki tells it, with the armies at war behind the duels before Laṅkā.
  - *Dharma Yuddha*: a fighting game in which every hero meets the foes he meets in Vālmīki, with keyboard and touch controls.

Nothing is wounded on screen: blows and astras land as light, and the vanquished go in a rising golden light. Rāvaṇa never touches Sītā.

## Run it

A static site with no build step:

```bash
python3 -m http.server 5173
# open http://localhost:5173   (add ?skip to pass the opening)
```

The libraries (GSAP, Lenis, Three.js) and fonts load from public CDNs.

## How it is made

- `index.html`, `css/`, `js/` — the site. `js/odyssey.js` is the book, `js/astra-fx.js` the light of the astras, `js/fight2d.js` the painted battlefield, `js/duels.js` the duel director, `js/stage3d/fight.js` the game, `js/calm.js` the governor that keeps every animation light (it sleeps out of view, rests when the reader is idle, and caps frame rates on modest devices).
- `assets/` — the paintings, character art, maps, films and narration.

The paintings and character art were made with AI image models (FLUX.2 Klein, Z-Image-Turbo) from hand-written captions and reviewed by eye; the opening film and the Glimpse were made with Google Gemini. Translations into Hindi, Marathi, Telugu, Tamil, Kannada and Malayalam were written with Claude (Anthropic), sentence by sentence against the English, and proofread. Music: a bansuri dhun by Pandit Hariprasad Chaurasia with Ustad Rashid Mustafa Thirakwa on tabla (IGRMS archive, CC BY-NC 4.0); ambience and effects are field recordings from Wikimedia Commons (credited on the site). Satellite imagery: NASA Blue Marble (public domain). Sarga numbering and verse translations follow valmikiramayan.net.

The production pipeline (painting, narration and translation tools) is kept in a separate private repository.

## Ownership

© 2026 Sanjeev Sudarsanam. All rights reserved. This repository is public to read, not to copy: no part of the site may be copied, re-hosted or reproduced without written permission (see LICENSE).
