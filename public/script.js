document.getElementById("scrapeButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/scrape");
    const result = await response.json();

    const arr = result.data.flat().filter((x) => x);
    console.log({ result: arr });

    const groupedArray = Array.from(
      { length: Math.ceil(arr.length / 4) },
      (_, i) => arr.slice(i * 4, i * 4 + 4)
    );

    if (result.success) {
      new gridjs.Grid({
        columns: ["Marca", "Modelo", "Importado", "Descrição"],
        search: true,
        sort: true,
        fixedHeader: true,
        height: "70vh",
        data: groupedArray,
        pagination: {
          limit: 10,
        },
        language: {
          search: {
            placeholder: "🔍 Buscar...",
          },
          pagination: {
            showing: "Mostrando ",
            to: "-",
            of: "de",
            results: () => "resultados",
          },
        },
      }).render(document.getElementById("table-wrapper"));
    } else {
      console.log(result.error);
    }
  } catch (error) {
    console.log(error.message);
  }
});
