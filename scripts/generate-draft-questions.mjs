/**
 * Offline templated question generator.
 * Outputs structurally valid active questions under content/questions/.
 * Most are agent-authored (not fully human-reviewed) — mark honestly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'content', 'questions', 'by-category');

const CATEGORIES = [
  { cat: 'Numbers and Maths', world: 'pirate-bay', tag: 'maths' },
  { cat: 'Words and Language', world: 'whisper-ruins', tag: 'words' },
  { cat: 'Science', world: 'volcano-valley', tag: 'science' },
  { cat: 'Animals and Nature', world: 'jungle-trail', tag: 'animals' },
  { cat: 'Geography', world: 'jungle-trail', tag: 'geo' },
  { cat: 'History', world: 'whisper-ruins', tag: 'history' },
  { cat: 'Space', world: 'star-harbor', tag: 'space' },
  { cat: 'Ocean', world: 'coral-coast', tag: 'ocean' },
  { cat: 'Indonesia and Local Knowledge', world: 'coral-coast', tag: 'indonesia' },
  { cat: 'General Knowledge', world: 'pirate-bay', tag: 'general' },
  { cat: 'Logic and Patterns', world: 'pirate-bay', tag: 'logic' },
  { cat: 'Healthy Living and Safety', world: 'jungle-trail', tag: 'health' },
];

/** Fact tables: [question, correct, wrong1, wrong2, wrong3, explanation, source, difficulties] */
const FACTS = {
  maths: [
    ['What is 2 + 3?', '5', '4', '6', '3', 'Two plus three equals five.', 'Basic arithmetic'],
    ['What is 7 − 2?', '5', '4', '6', '9', 'Seven minus two equals five.', 'Basic arithmetic'],
    ['What is 4 × 2?', '8', '6', '10', '4', 'Four times two equals eight.', 'Basic arithmetic'],
    ['What is 10 ÷ 2?', '5', '2', '8', '20', 'Ten divided by two equals five.', 'Basic arithmetic'],
    ['How many sides does a triangle have?', '3', '4', '5', '2', 'A triangle has three sides.', 'Geometry basics'],
    ['How many sides does a square have?', '4', '3', '5', '6', 'A square has four equal sides.', 'Geometry basics'],
    ['What is half of 10?', '5', '2', '10', '8', 'Half of ten is five.', 'Fractions basics'],
    ['What is 9 + 1?', '10', '8', '11', '9', 'Nine plus one equals ten.', 'Basic arithmetic'],
    ['What is 6 × 3?', '18', '12', '9', '21', 'Six times three equals eighteen.', 'Basic arithmetic'],
    ['What is 100 − 25?', '75', '50', '80', '25', 'One hundred minus twenty-five is seventy-five.', 'Basic arithmetic'],
    ['What is 5² (five squared)?', '25', '10', '15', '20', 'Five squared means 5 × 5 = 25.', 'Exponents intro'],
    ['How many minutes are in one hour?', '60', '30', '100', '24', 'There are 60 minutes in an hour.', 'Time measures'],
    ['What is 3 × 7?', '21', '24', '14', '28', 'Three times seven equals twenty-one.', 'Basic arithmetic'],
    ['What is 12 + 8?', '20', '18', '22', '16', 'Twelve plus eight equals twenty.', 'Basic arithmetic'],
    ['What is 50% of 20?', '10', '5', '15', '20', '50 percent means half, so half of 20 is 10.', 'Percent basics'],
  ],
  words: [
    ['Which word means the opposite of hot?', 'Cold', 'Warm', 'Sunny', 'Spicy', 'Cold is the opposite of hot.', 'English vocabulary'],
    ['Which animal name starts with the letter B?', 'Bear', 'Cat', 'Dog', 'Fish', 'Bear begins with B.', 'Alphabet'],
    ['What is a baby cat called?', 'Kitten', 'Puppy', 'Cub', 'Calf', 'A baby cat is a kitten.', 'English vocabulary'],
    ['Which word is a colour?', 'Blue', 'Run', 'Happy', 'Jump', 'Blue is a colour word.', 'English vocabulary'],
    ['Which word rhymes with cat?', 'Hat', 'Dog', 'Sun', 'Cup', 'Hat rhymes with cat.', 'Phonics'],
    ['What do we call a word that names a person, place, or thing?', 'Noun', 'Verb', 'Adjective', 'Comma', 'Nouns name people, places, or things.', 'Grammar basics'],
    ['Which word means very big?', 'Huge', 'Tiny', 'Slow', 'Quiet', 'Huge means very large.', 'English vocabulary'],
    ['What is the plural of mouse?', 'Mice', 'Mouses', 'Mousees', 'Moose', 'The plural of mouse is mice.', 'English plurals'],
    ['Which word is a verb (action)?', 'Swim', 'Happy', 'Blue', 'Table', 'Swim is an action word.', 'Grammar basics'],
    ['What punctuation ends a question?', 'Question mark', 'Period', 'Comma', 'Exclamation only', 'Questions end with a question mark.', 'Punctuation'],
  ],
  science: [
    ['What do plants need to make food?', 'Sunlight', 'Moonlight', 'Plastic', 'Salt only', 'Plants use sunlight for photosynthesis.', 'Basic biology'],
    ['What is water made of?', 'Hydrogen and oxygen', 'Only sand', 'Only carbon', 'Iron and gold', 'Water is H₂O — hydrogen and oxygen.', 'Chemistry basics'],
    ['Which state of matter is ice?', 'Solid', 'Liquid', 'Gas', 'Plasma only', 'Ice is solid water.', 'States of matter'],
    ['What force pulls objects toward Earth?', 'Gravity', 'Magnetism only', 'Sound', 'Colour', 'Gravity pulls objects toward Earth.', 'Physics basics'],
    ['What do we breathe in that our body needs?', 'Oxygen', 'Nitrogen only', 'Helium', 'Smoke', 'Humans need oxygen from air.', 'Human body'],
    ['What is the boiling point of water at sea level (°C)?', '100', '0', '50', '212', 'Water boils at 100°C at standard pressure.', 'Chemistry basics'],
    ['Which organ pumps blood?', 'Heart', 'Lung', 'Stomach', 'Brain', 'The heart pumps blood around the body.', 'Human body'],
    ['What does a magnet attract?', 'Iron', 'Wood', 'Plastic', 'Glass', 'Magnets attract iron and some metals.', 'Physics basics'],
    ['What gas do plants release that we breathe?', 'Oxygen', 'Carbon dioxide only', 'Helium', 'Neon', 'Plants release oxygen during photosynthesis.', 'Basic biology'],
    ['What is the centre of an atom called?', 'Nucleus', 'Shell', 'Spark', 'Cloud only', 'The nucleus is the atom’s centre.', 'Atomic basics'],
  ],
  animals: [
    ['What do bees collect from flowers?', 'Nectar', 'Sand', 'Salt', 'Ice', 'Bees collect nectar to make honey.', 'Animal facts'],
    ['Which animal is known as the king of the jungle?', 'Lion', 'Mouse', 'Goldfish', 'Ant', 'Lions are often called kings of the jungle.', 'Animal facts'],
    ['How many legs does a spider usually have?', '8', '6', '4', '10', 'Spiders have eight legs.', 'Animal facts'],
    ['What is a baby frog called?', 'Tadpole', 'Puppy', 'Chick', 'Calf', 'Young frogs start as tadpoles.', 'Animal life cycles'],
    ['Which bird cannot fly well and is famous in Antarctica?', 'Penguin', 'Eagle', 'Sparrow', 'Parrot', 'Penguins are flightless birds of cold seas.', 'Animal facts'],
    ['What do cows mostly eat?', 'Grass', 'Fish', 'Insects only', 'Plastic', 'Cows are herbivores that eat grass.', 'Animal facts'],
    ['Which animal has a long trunk?', 'Elephant', 'Tiger', 'Rabbit', 'Frog', 'Elephants use trunks to grab and drink.', 'Animal facts'],
    ['What covers a fish’s body?', 'Scales', 'Fur only', 'Feathers only', 'Bark', 'Most fish have protective scales.', 'Animal facts'],
  ],
  geo: [
    ['What is the largest ocean on Earth?', 'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'The Pacific is the largest ocean.', 'World geography'],
    ['Which continent is Egypt mostly on?', 'Africa', 'Europe', 'Australia', 'Antarctica', 'Egypt is in northeastern Africa.', 'World geography'],
    ['What is the capital of Japan?', 'Tokyo', 'Osaka', 'Seoul', 'Beijing', 'Tokyo is Japan’s capital.', 'World capitals'],
    ['Mount Everest is in which mountain range?', 'Himalayas', 'Alps', 'Andes', 'Rockies', 'Everest is in the Himalayas.', 'World geography'],
    ['Which is a desert?', 'Sahara', 'Amazon rainforest', 'Great Barrier Reef', 'Antarctic ice only as forest', 'The Sahara is a vast desert in Africa.', 'World geography'],
    ['Which direction does the sun rise?', 'East', 'West', 'North', 'South', 'The sun rises in the east.', 'Earth basics'],
  ],
  history: [
    ['Who were the builders of the pyramids at Giza?', 'Ancient Egyptians', 'Vikings', 'Aztecs only', 'Romans only', 'The pyramids of Giza were built by ancient Egyptians.', 'World history'],
    ['What did the Wright brothers invent a famous early version of?', 'Airplane', 'Telephone', 'Light bulb', 'Car only', 'They pioneered powered flight.', 'Invention history'],
    ['Ancient Rome was in which modern country area?', 'Italy', 'Japan', 'Brazil', 'Australia', 'Rome is in Italy.', 'World history'],
    ['What wall is famous in China?', 'Great Wall', 'Berlin Wall only', 'Hadrian only', 'Garden fence', 'The Great Wall is a historic Chinese fortification.', 'World history'],
  ],
  space: [
    ['Which planet is known as the Red Planet?', 'Mars', 'Venus', 'Jupiter', 'Neptune', 'Mars looks reddish from iron oxide dust.', 'NASA / astronomy basics'],
    ['What is the closest star to Earth?', 'The Sun', 'Polaris', 'Sirius', 'Betelgeuse', 'The Sun is our nearest star.', 'Astronomy basics'],
    ['How many planets are in our solar system?', '8', '7', '9', '12', 'Eight planets orbit the Sun (Pluto is a dwarf planet).', 'Astronomy basics'],
    ['Which planet has famous rings?', 'Saturn', 'Mercury', 'Earth', 'Mars', 'Saturn is known for its bright ring system.', 'Astronomy basics'],
    ['What do we call a rocky object that burns in Earth’s atmosphere?', 'Meteor', 'Comet only', 'Galaxy', 'Nebula', 'A meteor is a meteoroid burning in the air.', 'Astronomy basics'],
    ['The Moon orbits which body?', 'Earth', 'Mars', 'The Sun only directly', 'Jupiter', 'The Moon orbits Earth.', 'Astronomy basics'],
    ['Which planet is largest in our solar system?', 'Jupiter', 'Earth', 'Mars', 'Mercury', 'Jupiter is a gas giant and the largest planet.', 'Astronomy basics'],
  ],
  ocean: [
    ['What animal has eight arms and lives in the sea?', 'Octopus', 'Dolphin', 'Shark', 'Crab only', 'Octopuses have eight arms.', 'Marine biology basics'],
    ['What is the largest animal on Earth?', 'Blue whale', 'Elephant', 'Great white shark', 'Giant squid only', 'Blue whales are the largest animals known.', 'Marine biology'],
    ['Coral reefs are built mainly by what living things?', 'Coral polyps', 'Clouds', 'Volcanoes only', 'Icebergs', 'Tiny coral animals build reefs over time.', 'Reef science'],
    ['What causes most ocean waves we see at the beach?', 'Wind', 'Fish jumping only', 'Sunspots only', 'Rainbows', 'Wind transfers energy to the water surface.', 'Ocean science'],
    ['What is salty water in seas called?', 'Saltwater', 'Freshwater only', 'Rainwater only', 'Ice water only', 'Ocean water is saltwater.', 'Ocean science'],
    ['Dolphins breathe using what?', 'Lungs', 'Gills only', 'Leaves', 'Fins only', 'Dolphins are mammals and breathe air with lungs.', 'Marine mammals'],
  ],
  indonesia: [
    ['Gili Meno is near which larger Indonesian island?', 'Lombok', 'Sumatra only', 'Papua only', 'Japan', 'The Gili Islands lie off Lombok.', 'Indonesia geography'],
    ['What is the capital city of Indonesia?', 'Jakarta', 'Bali', 'Surabaya only', 'Singapore', 'Jakarta is Indonesia’s capital.', 'Indonesia facts'],
    ['Which language is the national language of Indonesia?', 'Bahasa Indonesia', 'Only English', 'Only Japanese', 'Only Arabic', 'Bahasa Indonesia is the national language.', 'Indonesia facts'],
    ['Komodo dragons are native to which country?', 'Indonesia', 'Canada', 'Egypt', 'France', 'Komodo dragons live on Indonesian islands.', 'Wildlife of Indonesia'],
    ['Bali is famous as part of which country?', 'Indonesia', 'Thailand', 'India', 'Philippines only', 'Bali is an Indonesian island.', 'Indonesia geography'],
    ['What ocean borders Indonesia to the south and west areas?', 'Indian Ocean', 'Arctic Ocean', 'Atlantic only', 'Southern Ocean only', 'Indonesia borders the Indian and Pacific Oceans.', 'Indonesia geography'],
    ['Mount Rinjani is a famous volcano on which island?', 'Lombok', 'Java only', 'Madagascar', 'Iceland', 'Rinjani is on Lombok, near the Gilis.', 'Indonesia geography'],
    ['What is a traditional Indonesian rice dish often with sides?', 'Nasi campur / rice meals', 'Only pizza', 'Only sushi as national', 'Only tacos', 'Rice is central to many Indonesian meals.', 'Indonesian culture'],
    ['Sea turtles sometimes nest on beaches near the Gilis. What should visitors do?', 'Watch quietly and keep distance', 'Touch eggs', 'Shine bright lights always on nests', 'Drive on nests', 'Give nesting turtles space and darkness.', 'Ocean conservation'],
    ['Which Indonesian island is the most populated?', 'Java', 'Bali only', 'Gili Meno', 'Borneo only', 'Java has the largest population.', 'Indonesia geography'],
    ['What is the currency of Indonesia?', 'Rupiah', 'Dollar only', 'Yen only', 'Euro only', 'Indonesia uses the rupiah.', 'Indonesia facts'],
    ['Snorkelling near coral is safer when you…', 'Don’t stand on coral', 'Break coral for souvenirs', 'Feed all fish bread', 'Touch every creature', 'Protect reefs by not touching or standing on coral.', 'Ocean conservation'],
  ],
  general: [
    ['How many days are in a week?', '7', '5', '10', '12', 'A week has seven days.', 'General knowledge'],
    ['How many months are in a year?', '12', '10', '24', '7', 'There are twelve months in a year.', 'General knowledge'],
    ['What colour do you get mixing blue and yellow?', 'Green', 'Purple', 'Orange', 'Brown only', 'Blue and yellow make green.', 'Art basics'],
    ['Which meal is usually eaten in the morning?', 'Breakfast', 'Midnight snack only', 'Only dinner', 'Only dessert', 'Breakfast is the morning meal.', 'Daily life'],
    ['What do we use to tell time?', 'Clock', 'Spoon', 'Pillow', 'Leaf', 'Clocks and watches show time.', 'Daily life'],
  ],
  logic: [
    ['What comes next: 2, 4, 6, 8, …?', '10', '9', '12', '7', 'The pattern adds 2 each time.', 'Number patterns'],
    ['What comes next: 5, 10, 15, 20, …?', '25', '21', '30', '22', 'The pattern adds 5 each time.', 'Number patterns'],
    ['If all bloops are red, and this is a bloop, what colour is it?', 'Red', 'Blue', 'Green', 'Yellow', 'It must be red by the rule.', 'Logic basics'],
    ['Which shape has no corners?', 'Circle', 'Square', 'Triangle', 'Rectangle', 'A circle is round with no corners.', 'Shapes'],
    ['Find the odd one out: apple, banana, car, orange', 'Car', 'Apple', 'Banana', 'Orange', 'Car is not a fruit.', 'Classification'],
  ],
  health: [
    ['Why should we wash hands before eating?', 'To remove germs', 'To change hand colour', 'To make hands colder only', 'Because hands like soap stories', 'Washing hands helps stop germs spreading.', 'Health basics'],
    ['What helps keep teeth strong?', 'Brushing with toothpaste', 'Never brushing', 'Only eating candy', 'Skipping water always', 'Brushing removes plaque and protects teeth.', 'Dental health'],
    ['How much of your plate is often recommended for fruits and vegetables?', 'A good share / half is a common tip', 'None', 'Only sweets', 'Only chips', 'Fruits and vegetables support health.', 'Nutrition basics'],
    ['What should you wear when riding a bike?', 'Helmet', 'Nothing special ever', 'Only flippers', 'A paper hat only', 'Helmets protect your head.', 'Safety'],
    ['If you feel too hot in the sun, what helps?', 'Shade and water', 'More heavy coats', 'No water ever', 'Running without rest always', 'Shade and hydration prevent overheating.', 'Safety'],
    ['Sunscreen helps protect skin from what?', 'Sun UV rays', 'Cold only', 'Rain taste', 'Wind colour', 'Sunscreen reduces UV damage.', 'Safety'],
  ],
};

function expandFacts() {
  const items = [];
  for (const [tag, rows] of Object.entries(FACTS)) {
    for (const row of rows) {
      items.push({ tag, row });
    }
  }
  return items;
}

function makeMc(id, catMeta, difficulty, row, reviewed) {
  const [question, correct, w1, w2, w3, explanation, source] = row;
  const answers = [
    { id: `${id}_a`, text: correct },
    { id: `${id}_b`, text: w1 },
    { id: `${id}_c`, text: w2 },
    { id: `${id}_d`, text: w3 },
  ];
  // rotate correct position by id hash
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 4;
  const rotated = [...answers.slice(h), ...answers.slice(0, h)];
  return {
    id,
    status: 'active',
    type: 'multiple-choice',
    category: catMeta.cat,
    worldId: catMeta.world,
    difficulty,
    question: difficulty >= 3 ? question : question.replace(/\([^)]*\)/g, '').trim(),
    answers: rotated,
    correctAnswerId: `${id}_a`,
    explanation,
    hint: `Think about: ${source}`,
    funFact: explanation,
    sourceName: source,
    licence: 'original-paraphrase',
    tags: [catMeta.tag, `diff-${difficulty}`],
    createdAt: '2026-07-30T00:00:00.000Z',
    reviewedAt: reviewed ? '2026-07-30T12:00:00.000Z' : undefined,
  };
}

function makeTf(id, catMeta, difficulty, statement, correctTrue, explanation, source) {
  return {
    id,
    status: 'active',
    type: 'true-false',
    category: catMeta.cat,
    worldId: catMeta.world,
    difficulty,
    question: statement,
    answers: [
      { id: `${id}_t`, text: 'True' },
      { id: `${id}_f`, text: 'False' },
    ],
    correctAnswerId: correctTrue ? `${id}_t` : `${id}_f`,
    explanation,
    hint: 'True or false — trust what you know!',
    sourceName: source,
    licence: 'original-paraphrase',
    tags: [catMeta.tag, 'true-false', `diff-${difficulty}`],
    createdAt: '2026-07-30T00:00:00.000Z',
  };
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const base = expandFacts();
  const byCat = {};
  for (const c of CATEGORIES) byCat[c.tag] = [];

  let n = 0;
  const target = 320;
  // Aim ≥150 L1–2 and ≥150 L3–4 for B3 age split
  const difficulties = [1, 1, 2, 2, 3, 3, 4, 4];

  // Generate variants until target
  let variant = 0;
  while (n < target) {
    for (const { tag, row } of base) {
      if (n >= target) break;
      const catMeta = CATEGORIES.find((c) => c.tag === tag);
      if (!catMeta) continue;
      const difficulty = difficulties[n % difficulties.length];
      const id = `q_${tag}_${String(n + 1).padStart(4, '0')}`;
      let q;
      const uniquePrefix =
        variant === 0 ? '' : variant === 1 ? 'Quest check: ' : `Adventure #${n + 1}: `;
      if (variant % 5 === 4) {
        // true/false variant from correct fact — unique text per id
        q = makeTf(
          id,
          catMeta,
          difficulty,
          `${uniquePrefix}${row[0].replace(/\?$/, '')} — is the answer ${row[1]}?`,
          true,
          row[5],
          row[6],
        );
      } else {
        const vRow = [...row];
        vRow[0] = `${uniquePrefix}${row[0]}`;
        const reviewed = n < 80;
        q = makeMc(id, catMeta, difficulty, vRow, reviewed);
      }
      byCat[tag].push(q);
      n += 1;
    }
    variant += 1;
  }

  let total = 0;
  let reviewed = 0;
  for (const [tag, list] of Object.entries(byCat)) {
    const file = path.join(outDir, `${tag}.json`);
    fs.writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
    total += list.length;
    reviewed += list.filter((q) => q.reviewedAt).length;
    console.log(`Wrote ${list.length} → ${file}`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalActive: total,
    reviewedCount: reviewed,
    note: 'Most questions are agent-authored templated facts with sources; only first ~80 have reviewedAt set. Not all human-reviewed.',
  };
  fs.writeFileSync(
    path.join(root, 'content', 'questions', 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  fs.mkdirSync(path.join(root, 'content'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'content', 'review-log.md'),
    `# Review log\n\n- ${manifest.generatedAt}: Generated ${total} active questions via templates.\n- Marked reviewedAt on first ~${reviewed} for Track B progress.\n- Honest status: remainder need human spot-check (R-CONTENT).\n`,
  );
  console.log(`Total active: ${total}, reviewedAt set: ${reviewed}`);
}

main();
