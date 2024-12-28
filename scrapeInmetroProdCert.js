const puppeteer = require("puppeteer");

async function scrapeInmetro() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const inmetroProdutosCertificados =
    "http://www.inmetro.gov.br/prodcert/produtos/busca.asp";

  await page.goto(inmetroProdutosCertificados, {
    waitUntil: "networkidle2", // Ensures the page has loaded completely
  });

  const selectClasseDeProduto = 'select[id="classe_produto"]';
  const valorOptionLuminariaParaIluminacaoPublica = "1928";

  // Select an option from the "Classe de Produto" dropdown
  await page.select(
    selectClasseDeProduto,
    valorOptionLuminariaParaIluminacaoPublica
  );

  // Click the "Buscar" button
  await page.click('input[name="Submit"]');

  // Wait for results to load
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("table");

  const results = [];

  const extractTableData = async () => {
    return await page.evaluate(() => {
      const rows = document.querySelectorAll("table[borderColor='#CCCCCC'] tr");
      return Array.from(rows)
        .slice(1)
        .map((row) => {
          const cells = row.querySelectorAll("td.listagem");
          const content = Array.from(cells).map((cell) =>
            cell.textContent.trim()
          );
          return content;
        });
    });
  };

  function getNextPage(x, y, z, groupSize = 10) {
    x += 1;
    let isEndOfRange = false;

    if (x > y + groupSize - 1) {
      y += groupSize;
      z += groupSize;
      isEndOfRange = true;
    }

    return { x, y, z, isEndOfRange };
  }

  let isLastPage = false;
  let pageNumber = 1;
  let pageRangeStart = 1;
  let pageRangeEnd = 10;

  while (!isLastPage) {
    console.log(`Scraping page ${pageNumber}`);

    // Extract table data from the current page
    const data = await extractTableData();
    results.push(...data);

    const pageSize = await page.evaluate(() => {
      return (
        document.querySelectorAll(
          "td[align='center'] > span.size10[onclick*=Pagina]"
        ) || []
      ).length;
    });

    const test = getNextPage(
      pageNumber,
      pageRangeStart,
      pageRangeEnd,
      pageSize
    );
    pageNumber = test.x;
    pageRangeStart = test.y;
    pageRangeEnd = test.z;

    if (test.isEndOfRange) {
      const firstButtonOfRange = await page.$(
        `td > span.size10[onclick*='Pagina(${pageRangeStart - pageSize},${
          pageRangeStart - pageSize
        },${pageRangeEnd - pageSize})']`
      );
      console.log(
        `Primeiro botão: Pagina(${pageRangeStart - pageSize},${
          pageRangeStart - pageSize
        },${pageRangeEnd - pageSize})`
      );
      if (!firstButtonOfRange) {
        isLastPage = true;
        continue;
      }

      firstButtonOfRange.click();
      await page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      const buttonNextRange = await page.$(
        "td[align='right'] > span.size10[onclick*=Pagina]"
      );

      if (!buttonNextRange) {
        isLastPage = true;
        continue;
      }

      buttonNextRange.click();
      await page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      continue;
    }

    // Check if a "Next" button exists
    const nextButton = await page.$(
      `td > span.size10[onclick*='Pagina(${pageNumber},${pageRangeStart},${
        pageSize >= 10 ? pageRangeEnd : pageRangeEnd - (10 - pageSize)
      })']`
    );
    console.log(
      !!nextButton,
      `NextButton -> Pagina(${pageNumber},${pageRangeStart},${
        pageSize >= 10 ? pageRangeEnd : pageRangeEnd - (10 - pageSize)
      })`
    );
    if (nextButton) {
      nextButton.click();
      await page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 60000,
      });
    } else {
      isLastPage = true;
    }
  }

  const filteredResult = results.filter((result) => result.length > 0);

  await browser.close();

  return filteredResult;
}

module.exports = scrapeInmetro;
