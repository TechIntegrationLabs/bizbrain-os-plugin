// Generate all checklist item icons via OpenAI API
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Set OPENAI_API_KEY environment variable');
  process.exit(1);
}
const OUT_DIR = path.join(__dirname, 'public', 'images');

const ICONS = [
  { id: 'brain-bootstrap', prompt: 'App icon: a glowing neural brain emerging from a digital scan grid, cyberpunk aesthetic with electric blue veins pulsing through translucent brain against deep black, holographic data particles, 3D render, premium square app icon' },
  { id: 'profile-selection', prompt: 'App icon: geometric human silhouette split into 5 colorful segments like stained glass, each segment a different vibrant neon color, minimalist with subtle 3D depth, warm amber glow, dark background, modern tech' },
  { id: 'claude-config', prompt: 'App icon: sleek precision gear mechanism with AI circuitry patterns inside, glowing emerald green accent lines, dark matte background, metallic chrome finish with neon accents, engineering aesthetic' },
  { id: 'folder-structure', prompt: 'App icon: open folder revealing a glowing galaxy of interconnected constellation nodes, purple and blue nebula colors, cosmic exploration theme, ethereal style, dark space background' },
  { id: 'obsidian-vault', prompt: 'App icon: obsidian crystal vault door with purple and violet light seeping through cracks, ancient meets futuristic, geometric obsidian patterns, magical energy inside, dramatic moody lighting' },
  { id: 'github-backup', prompt: 'App icon: shield with flowing binary data being captured into a protective green forcefield bubble, cybersecurity aesthetic, dark background, emerald green glow, futuristic defense system' },
  { id: 'auto-memory', prompt: 'App icon: a lightbulb made of flowing golden liquid memory streams, warm amber light radiating outward, memories as glowing particles orbiting the bulb, art nouveau meets tech, dark background' },
  { id: 'session-archiving', prompt: 'App icon: a crystalline archive box with layers of glowing blue documents being compressed into it, time capsule aesthetic, ice blue and silver tones, futuristic preservation vault, dark background' },
  { id: 'slack-integration', prompt: 'App icon: abstract chat bubbles forming a dynamic spiral pattern, teal and aqua gradients, fluid motion blur effect, modern communication aesthetic, organic shapes on dark background' },
  { id: 'gmail-integration', prompt: 'App icon: an envelope transforming into a paper airplane made of light, warm red and orange gradients, motion trails showing speed, minimalist origami style, dark background' },
  { id: 'discord-integration', prompt: 'App icon: a gaming headset emitting colorful sound waves in a spectrum pattern, indigo and purple tones, retro-futuristic gaming aesthetic, neon wireframe elements, dark background' },
  { id: 'calendar-integration', prompt: 'App icon: a holographic calendar grid floating in space with glowing event markers, time flowing as golden ribbons between dates, sci-fi interface aesthetic, blue and amber, dark background' },
  { id: 'whatsapp-bridge', prompt: 'App icon: two phones connected by a glowing bridge of green energy, WhatsApp green tones, digital bridge made of data streams, connectivity aesthetic, minimalist, dark background' },
  { id: 'notion-integration', prompt: 'App icon: an open book with pages transforming into digital blocks and databases, black and white minimalist with subtle warm highlights, knowledge architecture, isometric perspective, dark background' },
  { id: 'google-workspace', prompt: 'App icon: four interlocking geometric shapes (doc, sheet, slide, drive) forming a unified diamond, Google primary colors but muted and premium, crystalline facets, dark background' },
  { id: 'airtable-integration', prompt: 'App icon: a 3D spreadsheet grid rising from a flat surface into colorful data columns, teal and coral gradients, architectural data visualization, isometric city of data, dark background' },
  { id: 'todoist-integration', prompt: 'App icon: a checklist with items animating from unchecked to checked with satisfying green checkmarks and sparkle effects, achievement unlocked aesthetic, dark background, green accents' },
  { id: 'github-mcp', prompt: 'App icon: an octopus tentacle made of glowing code branches, each tentacle holding a different icon (PR, issue, repo), bioluminescent ocean creature aesthetic, deep sea blue and green, dark background' },
  { id: 'supabase-integration', prompt: 'App icon: a lightning bolt striking a database cylinder, electric green energy explosion, Supabase emerald green tones, power and speed aesthetic, particle effects, dark background' },
  { id: 'deployment-integration', prompt: 'App icon: a rocket launching from a laptop screen with a deployment progress trail, gradient from orange to blue as it ascends, speed lines, retro space poster style, dark background' },
  { id: 'playwright-integration', prompt: 'App icon: a robotic hand clicking a glowing browser window, teal wireframe web elements, automation puppet strings made of light, theatrical curtain framing, dark background' },
  { id: 'stripe-integration', prompt: 'App icon: a credit card dissolving into flowing streams of golden coins and data, payment processing visualized as a river of value, purple and gold tones, luxury fintech aesthetic, dark background' },
  { id: 'crm-integration', prompt: 'App icon: a network of people silhouettes connected by glowing relationship lines forming a heart shape at center, warm orange and coral tones, human connection meets data, dark background' },
  { id: 'docuseal-integration', prompt: 'App icon: a digital pen signing a contract that turns into a sealed wax stamp made of light, official document aesthetic with modern twist, burgundy and gold tones, dark background' },
  { id: 'bookkeeping-integration', prompt: 'App icon: a calculator transforming into a crystal ball showing financial charts and graphs, accounting meets fortune telling, green money tones with purple mystic accents, dark background' },
  { id: 'youtube-integration', prompt: 'App icon: a play button that is also a camera lens with film strip spiral, red gradients with cinematic light leaks, movie premiere aesthetic, spotlight beams, dark background' },
  { id: 'social-media', prompt: 'App icon: abstract social icons merging into a megaphone made of light, broadcasting colorful signals outward, gradient rainbow spectrum, social amplification aesthetic, dark background' },
  { id: 'design-tools', prompt: 'App icon: a paintbrush and pen tool crossing like swords, creating an explosion of color at the intersection point, creative tools meeting point, artistic splash, vivid colors on dark background' },
  { id: 'image-generation', prompt: 'App icon: a magic wand tapping a blank canvas that erupts with AI-generated imagery, surrealist style with melting clocks and floating objects, imagination unleashed, vibrant on dark background' },
  { id: 'presentations', prompt: 'App icon: a presentation slide transforming into a 3D stage with spotlight and audience silhouettes, theatrical presentation aesthetic, warm amber stage lighting, dark auditorium background' },
  { id: 'notebooklm', prompt: 'App icon: a notebook with pages flying out transforming into film frames and audio waves, research becoming media, scholarly meets cinematic, warm golden tones, dark background' },
  { id: 'brain-swarm', prompt: 'App icon: a hive of glowing hexagonal cells with tiny AI bees working in formation, bioluminescent swarm intelligence, amber and gold honeycomb pattern, organic technology aesthetic, dark background' },
  { id: 'meeting-transcription', prompt: 'App icon: sound waves being captured by a microphone and transforming into readable text lines, audio to text visualization, voice-print patterns, teal and white gradient, dark background' },
  { id: 'openclaw-setup', prompt: 'App icon: an eagle talon made of circuit boards gripping a glowing orb of connected chat bubbles from different platforms, powerful autonomous agent aesthetic, electric purple and silver, dark background' },
  { id: 'custom-mcp', prompt: 'App icon: a wrench and screwdriver forming an X with a glowing plug socket at center, custom tooling aesthetic, industrial orange and steel gray, workshop meets high tech, dark background' },
  { id: 'n8n-workflows', prompt: 'App icon: flowing data pipes connecting colorful nodes in a 3D workflow diagram, each node a different color processing step, plumbing meets computing, isometric pipeline, dark background' },
  { id: 'browser-suite', prompt: 'App icon: three browser windows stacked at angles with magnifying glass scanning through them, digital detective aesthetic, cool blue tones with warm search highlights, investigation theme, dark background' },
];

async function generateImage(item) {
  const outPath = path.join(OUT_DIR, `${item.id}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`SKIP ${item.id} (exists)`);
    return;
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-image-1',
      prompt: item.prompt,
      size: '1024x1024',
      quality: 'medium',
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.error) {
            console.log(`FAIL ${item.id}: ${data.error.message}`);
            reject(data.error);
            return;
          }
          if (data.data && data.data[0] && data.data[0].b64_json) {
            fs.writeFileSync(outPath, Buffer.from(data.data[0].b64_json, 'base64'));
            console.log(`OK   ${item.id}`);
          } else if (data.data && data.data[0] && data.data[0].url) {
            // Download from URL
            https.get(data.data[0].url, (imgRes) => {
              const chunks = [];
              imgRes.on('data', c => chunks.push(c));
              imgRes.on('end', () => {
                fs.writeFileSync(outPath, Buffer.concat(chunks));
                console.log(`OK   ${item.id} (url)`);
                resolve();
              });
            });
            return;
          } else {
            console.log(`FAIL ${item.id}: no image data`, JSON.stringify(data).slice(0, 200));
          }
          resolve();
        } catch (e) {
          console.log(`FAIL ${item.id}: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`FAIL ${item.id}: ${e.message}`);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Generating ${ICONS.length} icons...`);
  console.log(`Output: ${OUT_DIR}\n`);

  // Generate 3 at a time to stay within rate limits
  for (let i = 0; i < ICONS.length; i += 3) {
    const batch = ICONS.slice(i, i + 3);
    await Promise.all(batch.map(item => generateImage(item).catch(() => {})));
    if (i + 3 < ICONS.length) {
      await new Promise(r => setTimeout(r, 1000)); // Brief pause between batches
    }
  }

  console.log('\nDone!');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`Generated: ${files.length}/${ICONS.length} icons`);
}

main();
