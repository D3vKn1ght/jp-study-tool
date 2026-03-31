const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DISPLAY_HOST = HOST === '0.0.0.0' ? 'localhost' : HOST;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Proxy: Hiragana → Kanji conversion via Google Transliterate
app.get('/api/convert', async (req, res) => {
  const { text } = req.query;
  if (!text || text.trim() === '') {
    return res.json({ success: false, results: [] });
  }

  try {
    const url = `https://www.google.com/transliterate?langpair=ja-Hira|ja&text=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && Array.isArray(data)) {
      const results = data.map(item => ({
        input: item[0],
        candidates: item[1] || []
      }));
      return res.json({ success: true, results });
    }
    return res.json({ success: false, results: [] });
  } catch (error) {
    console.error('Kanji convert error:', error.message);
    return res.json({ success: false, results: [], error: error.message });
  }
});

// Proxy: Japanese → Vietnamese translation via Google Translate
app.get('/api/translate', async (req, res) => {
  const { text } = req.query;
  if (!text || text.trim() === '') {
    return res.json({ success: false, translation: '' });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();

    // Google Translate response: [[["translation","source",...],...],...]
    if (data && data[0]) {
      const translation = data[0].map(item => item[0]).join('');
      return res.json({ success: true, translation });
    }
    return res.json({ success: false, translation: '' });
  } catch (error) {
    console.error('Translate error:', error.message);
    return res.json({ success: false, translation: '', error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log('');
    console.log('  🎌 Japanese Typing Assistant');
    console.log('  ───────────────────────────');
    console.log(`  ✅ Server:  http://${DISPLAY_HOST}:${PORT}`);
    console.log('  📝 Gõ romaji → Hiển thị Hiragana, Katakana, Kanji & Nghĩa tiếng Việt');
    console.log('');
  });
}

module.exports = app;
