const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const inmetroProdutosCertificados = "http://www.inmetro.gov.br/prodcert/produtos/busca.asp";

  await page.goto(inmetroProdutosCertificados, {
    waitUntil: 'networkidle2', // Ensures the page has loaded completely
  });

  const selectClasseDeProduto = 'select[id="classe_produto"]';
  const valorOptionLuminariaParaIluminacaoPublica = "1928";

  // Select an option from the "Classe de Produto" dropdown
  await page.select(selectClasseDeProduto, valorOptionLuminariaParaIluminacaoPublica);

  // Click the "Buscar" button
  await page.click('input[name="Submit"]');

  // Wait for results to load
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('table');

  // Extract data (example: scraping table rows)
  const results = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr'); // Adjust selector for the results table
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map(cell => cell.textContent.trim());
    });
  });

  // Output the results
  console.log('Scraped Results:', results);

  // Close the browser
  await browser.close();
})();
