const express = require('express');
const scrapeInmetro = require('./scrapeInmetroProdCert');

const app = express();
const PORT = 3000;

// Serve static files (HTML, JS, CSS)
app.use(express.static('public'));

// Endpoint to trigger Puppeteer script
app.get('/scrape', async (req, res) => {
  try {
    const data = await scrapeInmetro();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error running Puppeteer script:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle 404 for other routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
