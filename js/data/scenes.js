// Scene choreography for every paragraph of the story, plus the sargas each episode
// covers (numbering as on valmikiramayan.net, used for the "Read the original" links).
// Grammar is documented in js/scene.js. Dialogue lines are retellings in our own words,
// faithful to Vālmīki; Devanagari lines are quotations of the original verses.

export const KANDA_DIR = {
  prologue: ['baala', 'bala'], bala: ['baala', 'bala'], ayodhya: ['ayodhya', 'ayodhya'], aranya: ['aranya', 'aranya'],
  kishkindha: ['kish', 'kishkindha'], sundara: ['sundara', 'sundara'], yuddha: ['yuddha', 'yuddha']
};
export function sargaUrl(book, n) {
  const d = KANDA_DIR[book]; if (!d) return null;
  return `https://www.valmikiramayan.net/utf8/${d[0]}/sarga${n}/${d[1]}_${n}_frame.htm`;
}

export const SARGAS = {
 "prologue-0": [
  1,
  1
 ],
 "prologue-1": [
  2,
  4
 ],
 "bala-0": [
  5,
  8
 ],
 "bala-1": [
  8,
  14
 ],
 "bala-2": [
  15,
  17
 ],
 "bala-3": [
  16,
  16
 ],
 "bala-4": [
  18,
  18
 ],
 "bala-5": [
  18,
  18
 ],
 "bala-6": [
  19,
  21
 ],
 "bala-7": [
  22,
  23
 ],
 "bala-8": [
  24,
  26
 ],
 "bala-9": [
  27,
  28
 ],
 "bala-10": [
  29,
  30
 ],
 "bala-11": [
  38,
  44
 ],
 "bala-12": [
  48,
  49
 ],
 "bala-13": [
  51,
  65
 ],
 "bala-15": [
  66,
  67
 ],
 "bala-16": [
  74,
  76
 ],
 "bala-17": [
  68,
  73
 ],
 "bala-18": [
  77,
  77
 ],
 "ayodhya-0": [
  1,
  5
 ],
 "ayodhya-1": [
  7,
  9
 ],
 "ayodhya-2": [
  10,
  12
 ],
 "ayodhya-3": [
  12,
  14
 ],
 "ayodhya-4": [
  16,
  19
 ],
 "ayodhya-5": [
  20,
  25
 ],
 "ayodhya-6": [
  26,
  30
 ],
 "ayodhya-7": [
  31,
  40
 ],
 "ayodhya-8": [
  37,
  40
 ],
 "ayodhya-9": [
  40,
  46
 ],
 "ayodhya-10": [
  50,
  52
 ],
 "ayodhya-11": [
  54,
  56
 ],
 "ayodhya-12": [
  57,
  64
 ],
 "ayodhya-13": [
  68,
  74
 ],
 "ayodhya-14": [
  75,
  82
 ],
 "ayodhya-15": [
  97,
  104
 ],
 "ayodhya-16": [
  106,
  112
 ],
 "ayodhya-17": [
  115,
  115
 ],
 "ayodhya-18": [
  117,
  119
 ],
 "aranya-0": [
  1,
  4
 ],
 "aranya-1": [
  5,
  10
 ],
 "aranya-2": [
  11,
  13
 ],
 "aranya-3": [
  14,
  16
 ],
 "aranya-4": [
  17,
  18
 ],
 "aranya-5": [
  19,
  30
 ],
 "aranya-6": [
  31,
  35
 ],
 "aranya-7": [
  36,
  41
 ],
 "aranya-8": [
  42,
  44
 ],
 "aranya-9": [
  45,
  45
 ],
 "aranya-10": [
  46,
  48
 ],
 "aranya-11": [
  49,
  49
 ],
 "aranya-12": [
  50,
  51
 ],
 "aranya-13": [
  52,
  56
 ],
 "aranya-14": [
  57,
  64
 ],
 "aranya-15": [
  67,
  68
 ],
 "aranya-16": [
  69,
  73
 ],
 "aranya-17": [
  74,
  74
 ],
 "kishkindha-0": [
  1,
  4
 ],
 "kishkindha-1": [
  5,
  7
 ],
 "kishkindha-2": [
  8,
  10
 ],
 "kishkindha-3": [
  11,
  12
 ],
 "kishkindha-4": [
  12,
  16
 ],
 "kishkindha-5": [
  17,
  18
 ],
 "kishkindha-6": [
  19,
  25
 ],
 "kishkindha-7": [
  26,
  30
 ],
 "kishkindha-8": [
  31,
  35
 ],
 "kishkindha-9": [
  36,
  44
 ],
 "kishkindha-10": [
  50,
  52
 ],
 "kishkindha-11": [
  53,
  63
 ],
 "kishkindha-12": [
  64,
  67
 ],
 "sundara-0": [
  1,
  1
 ],
 "sundara-1": [
  1,
  1
 ],
 "sundara-2": [
  2,
  3
 ],
 "sundara-3": [
  4,
  12
 ],
 "sundara-4": [
  13,
  19
 ],
 "sundara-5": [
  20,
  24
 ],
 "sundara-6": [
  27,
  27
 ],
 "sundara-7": [
  30,
  36
 ],
 "sundara-8": [
  37,
  40
 ],
 "sundara-9": [
  41,
  47
 ],
 "sundara-10": [
  48,
  48
 ],
 "sundara-11": [
  49,
  52
 ],
 "sundara-12": [
  53,
  54
 ],
 "sundara-13": [
  55,
  56
 ],
 "sundara-14": [
  57,
  65
 ],
 "yuddha-0": [
  1,
  5
 ],
 "yuddha-1": [
  6,
  16
 ],
 "yuddha-2": [
  17,
  19
 ],
 "yuddha-3": [
  21,
  22
 ],
 "yuddha-4": [
  22,
  22
 ],
 "yuddha-6": [
  41,
  41
 ],
 "yuddha-7": [
  42,
  44
 ],
 "yuddha-8": [
  45,
  50
 ],
 "yuddha-9": [
  59,
  59
 ],
 "yuddha-10": [
  60,
  63
 ],
 "yuddha-11": [
  65,
  67
 ],
 "yuddha-12": [
  73,
  74
 ],
 "yuddha-13": [
  85,
  91
 ],
 "yuddha-14": [
  102,
  105
 ],
 "yuddha-15": [
  106,
  108
 ],
 "yuddha-16": [
  110,
  113
 ],
 "yuddha-17": [
  114,
  118
 ],
 "yuddha-18": [
  121,
  124
 ],
 "yuddha-19": [
  125,
  127
 ],
 "yuddha-20": [
  128,
  128
 ],
 "uttara-0": [
  9,
  9
 ],
 "uttara-1": [
  10,
  10
 ],
 "uttara-2": [
  11,
  15
 ],
 "uttara-3": [
  16,
  16
 ],
 "uttara-4": [
  17,
  17
 ],
 "uttara-5": [
  26,
  26
 ],
 "uttara-6": [
  35,
  36
 ],
 "uttara-7": [
  39,
  40
 ],
 "uttara-8": [
  42,
  45
 ],
 "uttara-9": [
  46,
  49
 ],
 "uttara-10": [
  66,
  66
 ],
 "uttara-12": [
  93,
  94
 ],
 "uttara-13": [
  95,
  97
 ],
 "uttara-14": [
  103,
  106
 ],
 "uttara-15": [
  107,
  110
 ]
};

export const BEATS = {
 "prologue-0": [
  "ashram | valmiki@50 | motes | ",
  "ashram | narada@50 | motes | "
 ],
 "prologue-1": [
  "river/dawn | valmiki@50 | motes | ",
  "river/dawn | valmiki@50 | motes | ",
  "ashram | brahma@41 valmiki@59 | motes | "
 ],
 "bala-0": [
  "ayodhya |  | motes | ",
  "court | dasharatha@50 | motes | "
 ],
 "bala-1": [
  "court | dasharatha@32 vasishtha@50 sumantra@68 | motes | ",
  "yajna | rishyasringa@32 dasharatha@50 vasishtha@68 | motes | "
 ],
 "bala-2": [
  "heaven | brahma@41 indra@59 | motes | ",
  "cosmic | vishnu@41 garuda@59 | motes | "
 ],
 "bala-3": [
  "yajna | dasharatha@50 | motes | ",
  "palace | dasharatha@41 kausalya@59 | motes | "
 ],
 "bala-4": [
  "palace |  | motes | ",
  "palace | kaikeyi@41 sumitra@59 | motes | "
 ],
 "bala-5": [
  "palace |  | motes | ",
  "ashram | vasishtha@50 | motes | "
 ],
 "bala-6": [
  "court | vishwamitra@50 | motes | ",
  "court | dasharatha@50 | motes | "
 ],
 "bala-7": [
  "sarayu | vishwamitra@32 rama@50 lakshmana@68 | motes | "
 ],
 "bala-8": [
  "dandaka | vishwamitra@32 rama@50 lakshmana@68 | motes | ",
  "dandaka | tataka@50 | motes | "
 ],
 "bala-9": [
  "forest | vishwamitra@41 rama@59 | motes | "
 ],
 "bala-10": [
  "yajna | vishwamitra@50 | motes | ",
  "yajna | mareecha@50 | motes | "
 ],
 "bala-11": [
  "ganga | vishwamitra@32 rama@50 lakshmana@68 | motes | ",
  "heaven | ganga@50 | motes | "
 ],
 "bala-12": [
  "forest | vishwamitra@32 rama@50 lakshmana@68 | motes | ",
  "forest | rama@50 | motes | "
 ],
 "bala-13": [
  "mithila/day | janaka@32 vishwamitra@50 rama@68 | motes | ",
  "ashram | vasishtha@50 | motes | ",
  "himalaya | vishwamitra@50 | motes | "
 ],
 "bala-14": [
  "mithila/day | rama@41 lakshmana@59 | motes | ",
  "mithila/day | sita@50 | motes | "
 ],
 "bala-15": [
  "court | janaka@41 vishwamitra@59 | motes | ",
  "court |  | motes | ",
  "court | rama@41 vishwamitra@59 | motes | "
 ],
 "bala-16": [
  "court | parashurama@50 | motes | ",
  "court | rama@41 parashurama@59 | motes | ",
  "court | parashurama@41 rama@59 | motes | "
 ],
 "bala-17": [
  "mithila/day | dasharatha@32 vasishtha@50 bharata@68 | motes | ",
  "mithila/day | janaka@32 sita@50 rama@68 | motes | "
 ],
 "bala-18": [
  "ayodhya | rama@41 sita@59 | motes | "
 ],
 "ayodhya-0": [
  "palace | dasharatha@50 | motes | ",
  "palace/night |  | motes | "
 ],
 "ayodhya-1": [
  "palace/night | manthara@50 | motes | ",
  "chamber/night | manthara@41 kaikeyi@59 | motes | "
 ],
 "ayodhya-2": [
  "chamber/night | kaikeyi@50 | motes | ",
  "chamber/night | kaikeyi@50 | motes | "
 ],
 "ayodhya-3": [
  "chamber/night | dasharatha@41 kaikeyi@59 | motes | ",
  "chamber/night | dasharatha@50 | motes | "
 ],
 "ayodhya-4": [
  "chamber/night | rama@41 dasharatha@59 | motes | ",
  "chamber/night | rama@50 | motes | "
 ],
 "ayodhya-5": [
  "palace | kausalya@50 | motes | ",
  "palace | kausalya@50 | motes | "
 ],
 "ayodhya-6": [
  "palace | rama@41 sita@59 | motes | ",
  "forest | sita@50 | motes | "
 ],
 "ayodhya-7": [
  "palace | lakshmana@41 rama@59 | motes | ",
  "palace | lakshmana@41 urmila@59 | motes | "
 ],
 "ayodhya-8": [
  "court | kaikeyi@50 | motes | ",
  "court | rama@41 dasharatha@59 | motes | "
 ],
 "ayodhya-9": [
  "ayodhya | dasharatha@50 | motes | ",
  "river/night |  | motes | "
 ],
 "ayodhya-10": [
  "ganga | guha@41 rama@59 | motes | ",
  "ganga | rama@50 | motes | ",
  "ganga | sita@50 | motes | "
 ],
 "ayodhya-11": [
  "ashram | bharadwaja@32 rama@50 sita@68 | motes | ",
  "chitrakoot | rama@32 sita@50 lakshmana@68 | motes | "
 ],
 "ayodhya-12": [
  "palace | sumantra@41 dasharatha@59 | motes | ",
  "river/night |  | motes | "
 ],
 "ayodhya-13": [
  "forest | bharata@50 | motes | ",
  "chamber/night | bharata@50 | motes | "
 ],
 "ayodhya-14": [
  "sarayu | bharata@41 vasishtha@59 | motes | ",
  "ayodhya | bharata@50 | motes | "
 ],
 "ayodhya-15": [
  "chitrakoot | lakshmana@50 | motes | ",
  "chitrakoot | bharata@41 rama@59 | motes | ",
  "chitrakoot | bharata@41 rama@59 | motes | "
 ],
 "ayodhya-16": [
  "chitrakoot | bharata@41 rama@59 | motes | ",
  "chitrakoot | bharata@50 | motes | "
 ],
 "ayodhya-17": [
  "ayodhya | bharata@50 | motes | "
 ],
 "ayodhya-18": [
  "ashram | atri@41 anasuya@59 | motes | ",
  "ashram | anasuya@41 sita@59 | motes | "
 ],
 "aranya-0": [
  "dandaka |  | motes | ",
  "dandaka | lakshmana@41 sita@59 | motes | "
 ],
 "aranya-1": [
  "dandaka | rama@41 lakshmana@59 | motes | ",
  "ashram | rama@32 sita@50 lakshmana@68 | motes | "
 ],
 "aranya-2": [
  "ashram | agastya@50 | motes | ",
  "ashram | agastya@41 rama@59 | motes | "
 ],
 "aranya-3": [
  "forest | lakshmana@41 jatayu@59 | motes | ",
  "panchavati | lakshmana@50 | motes | "
 ],
 "aranya-4": [
  "panchavati | shurpanakha@50 | motes | ",
  "panchavati | shurpanakha@41 sita@59 | motes | "
 ],
 "aranya-5": [
  "panchavati | rama@50 | motes | ",
  "panchavati | lakshmana@41 sita@59 | motes | "
 ],
 "aranya-6": [
  "court/night | shurpanakha@41 ravana@59 | motes | ",
  "court/night | shurpanakha@41 ravana@59 | motes | "
 ],
 "aranya-7": [
  "shore | ravana@50 | motes | ",
  "shore | mareecha@50 | motes | "
 ],
 "aranya-8": [
  "panchavati | sita@50 | motes | ",
  "dandaka | rama@50 | motes | "
 ],
 "aranya-9": [
  "panchavati | sita@41 lakshmana@59 | motes | ",
  "panchavati | lakshmana@50 | motes | "
 ],
 "aranya-10": [
  "panchavati | ravana@50 | motes | ",
  "panchavati | ravana@50 | motes | "
 ],
 "aranya-11": [
  "panchavati | ravana@41 sita@59 | motes | ",
  "panchavati | ravana@41 sita@59 | motes | "
 ],
 "aranya-12": [
  "sky | jatayu@50 | motes | ",
  "sky | jatayu@41 ravana@59 | motes | "
 ],
 "aranya-13": [
  "sky | sita@50 | motes | ",
  "lanka | ravana@41 sita@59 | motes | "
 ],
 "aranya-14": [
  "dandaka | rama@41 lakshmana@59 | motes | ",
  "panchavati | rama@50 | motes | "
 ],
 "aranya-15": [
  "forest | jatayu@32 rama@50 lakshmana@68 | motes | ",
  "forest | rama@41 jatayu@59 | motes | "
 ],
 "aranya-16": [
  "dandaka | kabandha@32 rama@50 lakshmana@68 | motes | ",
  "dandaka | rama@50 | motes | "
 ],
 "aranya-17": [
  "pampa | shabari@50 | motes | ",
  "pampa | shabari@41 rama@59 | motes | "
 ],
 "kishkindha-0": [
  "rocks | sugriva@50 | motes | ",
  "pampa | rama@41 lakshmana@59 | motes | "
 ],
 "kishkindha-1": [
  "rocks | rama@32 sugriva@50 hanuman@68 | motes | ",
  "rocks | sugriva@41 rama@59 | motes | "
 ],
 "kishkindha-2": [
  "rocks | sugriva@41 rama@59 | motes | ",
  "kishkindha | vali@41 sugriva@59 | motes | "
 ],
 "kishkindha-3": [
  "rocks | rama@50 | motes | "
 ],
 "kishkindha-4": [
  "kishkindha | sugriva@41 vali@59 | motes | ",
  "kishkindha | tara@41 vali@59 | motes | "
 ],
 "kishkindha-5": [
  "kishkindha | vali@41 rama@59 | motes | ",
  "kishkindha | vali@50 | motes | "
 ],
 "kishkindha-6": [
  "kishkindha | tara@41 angada@59 | motes | "
 ],
 "kishkindha-7": [
  "kishkindha | sugriva@41 angada@59 | motes | ",
  "cave | rama@50 | motes | "
 ],
 "kishkindha-8": [
  "kishkindha | sugriva@50 | motes | ",
  "kishkindha | tara@41 lakshmana@59 | motes | "
 ],
 "kishkindha-9": [
  "rocks | sugriva@50 | motes | ",
  "rocks | rama@41 hanuman@59 | motes | "
 ],
 "kishkindha-10": [
  "rocks | angada@41 hanuman@59 | motes | "
 ],
 "kishkindha-11": [
  "shore | angada@50 | motes | ",
  "shore | sampati@50 | motes | "
 ],
 "kishkindha-12": [
  "shore | angada@41 jambavan@59 | motes | ",
  "shore | jambavan@41 hanuman@59 | motes | ",
  "shore | hanuman@50 | motes | "
 ],
 "sundara-0": [
  "rocks | hanuman@50 | motes | ",
  "ocean | hanuman@50 | motes | "
 ],
 "sundara-1": [
  "ocean | hanuman@50 | motes | ",
  "ocean | hanuman@50 | motes | ",
  "ocean | hanuman@50 | motes | "
 ],
 "sundara-2": [
  "lanka | hanuman@50 | motes | ",
  "lanka/night | lankini@50 | motes | "
 ],
 "sundara-3": [
  "lanka | hanuman@50 | motes | ",
  "palace/night | hanuman@50 | motes | ",
  "lanka | hanuman@50 | motes | "
 ],
 "sundara-4": [
  "ashoka | hanuman@50 | motes | ",
  "ashoka | hanuman@50 | motes | "
 ],
 "sundara-5": [
  "ashoka | ravana@50 | motes | ",
  "ashoka | sita@50 | motes | ",
  "ashoka | ravana@50 | motes | "
 ],
 "sundara-6": [
  "ashoka | trijata@50 | motes | "
 ],
 "sundara-7": [
  "ashoka | hanuman@50 | motes | ",
  "ashoka | hanuman@41 sita@59 | motes | ",
  "ashoka | sita@50 | motes | "
 ],
 "sundara-8": [
  "ashoka | hanuman@41 sita@59 | motes | ",
  "ashoka | sita@41 hanuman@59 | motes | "
 ],
 "sundara-9": [
  "ashoka | hanuman@50 | motes | ",
  "lanka | hanuman@50 | motes | "
 ],
 "sundara-10": [
  "lanka | indrajit@50 | motes | "
 ],
 "sundara-11": [
  "court/night | ravana@41 hanuman@59 | motes | ",
  "court/night | hanuman@50 | motes | "
 ],
 "sundara-12": [
  "lanka/night | hanuman@50 | motes | ",
  "lanka/night | hanuman@50 | motes | "
 ],
 "sundara-13": [
  "lanka | hanuman@50 | motes | "
 ],
 "sundara-14": [
  "shore | angada@41 jambavan@59 | motes | ",
  "rocks | hanuman@41 rama@59 | motes | "
 ],
 "yuddha-0": [
  "rocks | rama@32 lakshmana@50 sugriva@68 | motes | "
 ],
 "yuddha-1": [
  "court/night | ravana@50 | motes | ",
  "court/night | ravana@50 | motes | "
 ],
 "yuddha-2": [
  "shore | vibhishana@41 sugriva@59 | motes | ",
  "shore | vibhishana@41 rama@59 | motes | "
 ],
 "yuddha-3": [
  "shore | rama@50 | motes | ",
  "ocean | samudra@41 rama@59 | motes | "
 ],
 "yuddha-4": [
  "shore | hanuman@50 | motes | ",
  "setu |  | motes | "
 ],
 "yuddha-5": [
  "shore | rama@50 | motes | "
 ],
 "yuddha-6": [
  "shore | rama@41 angada@59 | motes | ",
  "court/night | angada@50 | motes | "
 ],
 "yuddha-7": [
  "battle |  | motes | "
 ],
 "yuddha-8": [
  "battle | rama@41 lakshmana@59 | motes | ",
  "battle | garuda@50 | motes | "
 ],
 "yuddha-9": [
  "battle | ravana@41 lakshmana@59 | motes | ",
  "battle | rama@32 hanuman@50 ravana@68 | motes | "
 ],
 "yuddha-10": [
  "court/night | ravana@50 | motes | ",
  "court/night | kumbhakarna@41 ravana@59 | motes | "
 ],
 "yuddha-11": [
  "battle | kumbhakarna@41 sugriva@59 | motes | "
 ],
 "yuddha-12": [
  "battle | indrajit@41 lakshmana@59 | motes | ",
  "battle/night | sushena@41 hanuman@59 | motes | ",
  "battle/night | sushena@41 lakshmana@59 | motes | "
 ],
 "yuddha-13": [
  "battle | vibhishana@41 lakshmana@59 | motes | ",
  "battle | lakshmana@41 indrajit@59 | motes | "
 ],
 "yuddha-14": [
  "battle | ravana@50 | motes | ",
  "battle/dusk | rama@50 | motes | "
 ],
 "yuddha-15": [
  "battle | rama@41 ravana@59 | motes | ",
  "battle | rama@50 | motes | "
 ],
 "yuddha-16": [
  "battle | mandodari@50 | motes | ",
  "court/night | vibhishana@50 | motes | "
 ],
 "yuddha-17": [
  "ashoka | hanuman@41 sita@59 | motes | ",
  "battle | sita@41 lakshmana@59 | motes | ",
  "battle | agni@41 sita@59 | motes | "
 ],
 "yuddha-18": [
  "ashram/day | rama@50 | motes | ",
  "sky | rama@41 hanuman@59 | motes | "
 ],
 "yuddha-19": [
  "ashram/day | hanuman@41 bharata@59 | motes | ",
  "ashram/day | bharata@50 | motes | "
 ],
 "yuddha-20": [
  "ayodhya/dusk |  | motes | ",
  "court | sita@41 hanuman@59 | motes | ",
  "ayodhya | rama@41 sita@59 | motes | "
 ],
 "uttara-0": [
  "court | agastya@41 rama@59 | motes | "
 ],
 "uttara-1": [
  "himalaya | ravana@32 kumbhakarna@50 vibhishana@68 | motes | ",
  "himalaya | kumbhakarna@50 | motes | "
 ],
 "uttara-2": [
  "lanka | kubera@50 | motes | "
 ],
 "uttara-3": [
  "kailasa | ravana@50 | motes | ",
  "kailasa | ravana@50 | motes | "
 ],
 "uttara-4": [
  "himalaya |  | motes | "
 ],
 "uttara-5": [
  "heaven | ravana@50 | motes | "
 ],
 "uttara-6": [
  "court | agastya@50 | motes | ",
  "sky | indra@50 | motes | ",
  "ashram |  | motes | "
 ],
 "uttara-7": [
  "court | rama@41 sugriva@59 | motes | "
 ],
 "uttara-8": [
  "palace | sita@50 | motes | ",
  "palace/night | rama@50 | motes | "
 ],
 "uttara-9": [
  "ganga | lakshmana@41 sita@59 | motes | ",
  "ashram | valmiki@41 sita@59 | motes | "
 ],
 "uttara-10": [
  "ashram/night | sita@50 | motes | ",
  "ashram | lava@32 kusha@50 valmiki@68 | motes | "
 ],
 "uttara-11": [
  "forest |  | motes | ",
  "forest | lava@41 kusha@59 | motes | "
 ],
 "uttara-12": [
  "court | lava@32 kusha@50 rama@68 | motes | ",
  "court | rama@50 | motes | "
 ],
 "uttara-13": [
  "court | sita@41 valmiki@59 | motes | ",
  "court | sita@50 | motes | ",
  "court | rama@41 brahma@59 | motes | "
 ],
 "uttara-14": [
  "court | kala@41 rama@59 | motes | ",
  "palace | durvasa@41 lakshmana@59 | motes | "
 ],
 "uttara-15": [
  "ayodhya | rama@32 lava@50 kusha@68 | motes | ",
  "sarayu | brahma@50 | motes | ",
  "ashram | valmiki@50 | motes | "
 ]
};
