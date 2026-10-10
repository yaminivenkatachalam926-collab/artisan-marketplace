const fs = require('fs');
const path = require('path');

const LANGUAGES = { en: 'English', ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi' };
const CATEGORIES = ['Textiles', 'Pottery', 'Jewelry', 'Woodwork', 'Metalwork', 'Paintings', 'Basketry', 'Leather', 'Home Decor', 'Other'];

function fallback({ title, materials, category, notes, languages }) {
  const descriptions = {};
  const matStr = materials ? ` crafted from ${materials}` : '';
  const noteStr = notes ? ` ${notes}.` : '';

  languages.forEach((l) => {
    switch (l) {
      case 'ta':
        descriptions.ta = `இந்த பாரம்பரிய ${title} கைவினைப் பொருள் இயற்கை முறையில்${materials ? ' (' + materials + ')' : ''} நுணுக்கமாக உருவாக்கப்பட்டது.${noteStr} திறமையான கலைஞரின் கைவண்ணத்தில் உருவான ஒவ்வொரு படைப்பும் தனித்துவம் வாய்ந்தது மற்றும் நீடித்து உழைக்கக்கூடியது.`;
        break;
      case 'hi':
        descriptions.hi = `यह आकर्षक ${title} पारंपरिक भारतीय शिल्प कौशल से${materials ? ' (' + materials + ')' : ''} तैयार किया गया है।${noteStr} सिद्धहस्त कारीगर द्वारा हस्तनिर्मित हर कलाकृति अद्वितीय, पर्यावरण-अनुकूल और टिकाऊ है।`;
        break;
      case 'te':
        descriptions.te = `ఈ విశిష్టమైన ${title} సంప్రదాయ నైపుణ్యంతో${materials ? ' (' + materials + ')' : ''} చేతితో ఎంతో చక్కగా రూపొందించబడింది.${noteStr} నైపుణ్యం కలిగిన కళాకారుల చేతితో తయారైన ప్రతి వస్తువు నాణ్యమైనది మరియు ప్రత్యేకమైనది.`;
        break;
      case 'kn':
        descriptions.kn = `ಈ ಸುಂದರವಾದ ${title} ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲ ಕೌಶಲ್ಯದಿಂದ${materials ? ' (' + materials + ')' : ''} ಅತ್ಯಂತ ಕಾಳಜಿಯಿಂದ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ.${noteStr} ಕಲಾಕಾರರ ಕೈಚಳಕದಲ್ಲಿ ಮೂಡಿಬಂದ ಈ ಕಲಾಕೃತಿ ಬಾಳಿಕೆ ಬರುವಂತಹದ್ದು.`;
        break;
      case 'ml':
        descriptions.ml = `പരമ്പരാഗത ശൈലിയിൽ${materials ? ' (' + materials + ')' : ''} നിർമ്മിച്ച മനോഹരമായ ${title} കരകൗശല ഉൽപ്പന്നം.${noteStr} ഓരോ ഇനവും സൂക്ഷ്മതയോടെയും അർപ്പണബോധത്തോടെയും കൈകൊണ്ട് തീർത്തതാണ്.`;
        break;
      case 'bn':
        descriptions.bn = `ঐতিহ্যবাহী লোকশিল্পের ছোঁয়ায়${materials ? ' (' + materials + ')' : ''} হস্তনির্মিত এই ${title} একটি অপূর্ব শিল্পকর্ম।${noteStr} দক্ষ কারিগরদের ভালোবাসা ও দক্ষতায় তৈরি প্রতিটি উপাদান অনন্য ও টেকসই।`;
        break;
      case 'mr':
        descriptions.mr = `ही उत्कृष्ट हस्तनिर्मित ${title} पारंपारिक कारागिरीने${materials ? ' (' + materials + ')' : ''} बारकाईने घडवली आहे.${noteStr} कुशल कारागिरांनी हाताने बनवलेली ही वस्तू सुंदर आणि दीर्घकाळ टिकणारी आहे.`;
        break;
      case 'en':
      default:
        descriptions.en = `This authentic handmade ${title} is an exquisite ${category.toLowerCase()} creation${matStr}.${noteStr} Lovingly hand-shaped by a traditional artisan, preserving ancestral craftsmanship while adding warmth and sustainable charm to modern spaces.`;
        break;
    }
  });

  const keywords = [title, category, materials, 'handmade', 'artisan', 'sustainable', 'handcrafted', 'traditional', 'authentic']
    .filter(Boolean)
    .flatMap((s) => s.toLowerCase().split(/[,\s]+/))
    .filter((w) => w.length > 2);

  return {
    descriptions,
    keywords: [...new Set(keywords)].slice(0, 10),
    category: category && CATEGORIES.includes(category) ? category : 'Other',
    source: 'fallback',
  };
}

exports.generate = async ({ title, materials = '', category = '', notes = '', languages = ['en'], imagePath }) => {
  languages = languages.filter((l) => LANGUAGES[l]);
  if (!languages.length) languages = ['en'];
  if (!process.env.ANTHROPIC_API_KEY) return fallback({ title, materials, category: category || 'Other', notes, languages });

  const content = [];
  if (imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const media = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    content.push({ type: 'image', source: { type: 'base64', media_type: media, data: fs.readFileSync(imagePath).toString('base64') } });
  }
  content.push({
    type: 'text',
    text: `You write product listings for handmade crafts sold by independent artisans.
Product title: ${title}
Materials: ${materials || 'not given'}
Category hint: ${category || 'not given'}
Artisan notes: ${notes || 'none'}

Return ONLY valid JSON (no markdown) in this exact shape:
{"category": one of ${JSON.stringify(CATEGORIES)},
 "keywords": [8 to 10 short lowercase search keywords in English],
 "descriptions": {${languages.map((l) => `"${l}": "..."`).join(', ')}}}
Each description: 2-3 warm, honest sentences (60-90 words) covering look, materials, craft technique and use. Do not invent facts that are not given or visible. Write the descriptions in these languages in order: ${languages.map((l) => `${l}=${LANGUAGES[l]}`).join(', ')}, using each language's native script.`,
  });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 1500, messages: [{ role: 'user', content }] }),
  });
  if (!res.ok) throw new Error(`AI service error (${res.status})`);
  const data = await res.json();
  const text = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('').replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);
  return {
    descriptions: parsed.descriptions,
    keywords: parsed.keywords || [],
    category: CATEGORIES.includes(parsed.category) ? parsed.category : category || 'Other',
    source: 'ai',
  };
};

exports.LANGUAGES = LANGUAGES;
exports.CATEGORIES = CATEGORIES;
