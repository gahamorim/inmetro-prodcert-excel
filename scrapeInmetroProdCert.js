const puppeteer = require('puppeteer');

async function scrapeInmetro() {
  const browser = await puppeteer.launch({ headless: false });
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

  const results = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr');
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td.listagem');
      const content = Array.from(cells).map(cell => cell.textContent.trim());
      return content;
    });
  });
  const filteredResult = results.filter((result) => result.length > 0);

  await browser.close();

  return filteredResult;
};

module.exports = scrapeInmetro;
