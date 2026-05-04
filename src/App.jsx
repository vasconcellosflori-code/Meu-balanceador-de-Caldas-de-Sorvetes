import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import * as XLSX from "xlsx";

const ingredientesIniciais = [
  { id: 1, nome: "Água filtrada", g: 520, custoKg: 0.01, solidos: 0, carboidratos: 0, acucares: 0, acucaresAdicionados: 0, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0, proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 0, pod: 0, pac: 0 },
  { id: 2, nome: "Açúcar cristal", g: 120, custoKg: 4.50, solidos: 100, carboidratos: 100, acucares: 100, acucaresAdicionados: 100, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0, proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 0, pod: 100, pac: 100 },
  { id: 3, nome: "Dextrose", g: 45, custoKg: 8.00, solidos: 92, carboidratos: 92, acucares: 92, acucaresAdicionados: 92, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0, proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 0, pod: 70, pac: 171 },
  { id: 4, nome: "Glucose líquida", g: 35, custoKg: 7.00, solidos: 80, carboidratos: 80, acucares: 65, acucaresAdicionados: 65, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0, proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 0, pod: 45, pac: 75 },
  { id: 5, nome: "Leite integral", g: 160, custoKg: 4.20, solidos: 12, carboidratos: 4.8, acucares: 4.8, acucaresAdicionados: 0, gordura: 3.2, gorduraSaturada: 2.0, gorduraTrans: 0.1, proteina: 3.2, lactose: 4.8, sngl: 8.8, fibra: 0, sodio: 50, estabilizante: 0, pod: 4.8, pac: 4.8 },
  { id: 6, nome: "Creme de leite 25%", g: 75, custoKg: 18.00, solidos: 31, carboidratos: 3, acucares: 3, acucaresAdicionados: 0, gordura: 25, gorduraSaturada: 16, gorduraTrans: 0.6, proteina: 2, lactose: 3, sngl: 6, fibra: 0, sodio: 35, estabilizante: 0, pod: 3, pac: 3 },
  { id: 7, nome: "Leite em pó desnatado", g: 40, custoKg: 32.00, solidos: 96, carboidratos: 52, acucares: 52, acucaresAdicionados: 0, gordura: 1, gorduraSaturada: 0.6, gorduraTrans: 0, proteina: 34, lactose: 52, sngl: 95, fibra: 0, sodio: 500, estabilizante: 0, pod: 52, pac: 52 },
  { id: 8, nome: "Estabilizante", g: 5, custoKg: 65.00, solidos: 100, carboidratos: 0, acucares: 0, acucaresAdicionados: 0, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0, proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 100, pod: 0, pac: 0 }
];

const faixas = {
  solidos: [36, 42],
  gordura: [5, 10],
  acucares: [16, 22],
  sngl: [8, 12],
  proteina: [3, 5],
  lactose: [4, 7],
  estabilizante: [0.3, 0.8],
  pod: [14, 18],
  pac: [20, 28],
  agua: [58, 64],
  ponto: [-1.6, -1.1]
};

const vd = {
  energia: 2000,
  carboidratos: 300,
  acucaresAdicionados: 50,
  proteina: 75,
  gordura: 55,
  gorduraSaturada: 20,
  fibra: 25,
  sodio: 2000
};

function num(valor) { return Number(valor || 0); }
function fmt(valor, casas = 1) { return Number(valor || 0).toFixed(casas).replace(".", ","); }
function arred(valor) { return Math.round(Number(valor || 0)); }

function status(valor, faixa) {
  if (valor < faixa[0]) return "baixo";
  if (valor > faixa[1]) return "alto";
  return "ok";
}

function textoStatus(valor, faixa) {
  const s = status(valor, faixa);
  if (s === "ok") return "OK";
  if (s === "baixo") return "Baixo";
  return "Alto";
}

function corStatus(valor, faixa) {
  const s = status(valor, faixa);
  if (s === "ok") return "#16a34a";
  if (s === "baixo") return "#f59e0b";
  return "#dc2626";
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function pegarValor(linha, opcoes, padrao = 0) {
  const chaves = Object.keys(linha);
  for (const opcao of opcoes) {
    const alvo = normalizarTexto(opcao);
    const encontrada = chaves.find(chave => normalizarTexto(chave) === alvo);
    if (encontrada !== undefined && linha[encontrada] !== undefined && linha[encontrada] !== "") {
      return linha[encontrada];
    }
  }
  return padrao;
}

function converterLinhaExcel(linha, index) {
  return {
    id: Date.now() + index,
    nome: String(pegarValor(linha, ["Ingrediente", "Nome", "Produto", "Insumo"], `Ingrediente ${index + 1}`)),
    g: Number(pegarValor(linha, ["g", "gramas", "quantidade", "peso", "peso g", "kg"], 0)),
    custoKg: Number(pegarValor(linha, ["Custo/kg", "Custo kg", "CustoKg", "R$/kg", "Preco/kg", "Preço/kg"], 0)),
    solidos: Number(pegarValor(linha, ["Sólidos %", "Solidos %", "Sólidos", "Solidos", "ST"], 0)),
    carboidratos: Number(pegarValor(linha, ["Carboidratos %", "Carboidratos", "Carboidrato"], 0)),
    acucares: Number(pegarValor(linha, ["Açúcares totais %", "Acucares totais %", "Açúcares", "Acucares", "Açúcar", "Acucar"], 0)),
    acucaresAdicionados: Number(pegarValor(linha, ["Açúcares adicionados %", "Acucares adicionados %", "Açúcar adicionado", "Acucar adicionado"], 0)),
    gordura: Number(pegarValor(linha, ["Gordura %", "Gordura", "Gorduras totais", "Gordura total"], 0)),
    gorduraSaturada: Number(pegarValor(linha, ["Gord. saturada %", "Gordura saturada %", "Gordura saturada", "Gorduras saturadas"], 0)),
    gorduraTrans: Number(pegarValor(linha, ["Gord. trans %", "Gordura trans %", "Gordura trans", "Gorduras trans"], 0)),
    proteina: Number(pegarValor(linha, ["Proteína %", "Proteina %", "Proteína", "Proteina"], 0)),
    lactose: Number(pegarValor(linha, ["Lactose %", "Lactose"], 0)),
    sngl: Number(pegarValor(linha, ["SNGL %", "SNGL", "Sólidos não gordurosos do leite", "Solidos nao gordurosos do leite"], 0)),
    fibra: Number(pegarValor(linha, ["Fibra %", "Fibra", "Fibras", "Fibras alimentares"], 0)),
    sodio: Number(pegarValor(linha, ["Sódio mg/100g", "Sodio mg/100g", "Sódio", "Sodio"], 0)),
    estabilizante: Number(pegarValor(linha, ["Estabilizante %", "Estabilizante", "Gomas", "Goma"], 0)),
    pod: Number(pegarValor(linha, ["POD", "Dulçor", "Dulcor"], 0)),
    pac: Number(pegarValor(linha, ["PAC", "AFP", "Poder anticongelante"], 0))
  };
}

function App() {
  const [nomeReceita, setNomeReceita] = useState("Base branca cremosa");
  const [ingredientes, setIngredientes] = useState(ingredientesIniciais);
  const [perdaProcesso, setPerdaProcesso] = useState(3);
  const [overrun, setOverrun] = useState(35);
  const [loteDesejado, setLoteDesejado] = useState(10000);
  const [porcao, setPorcao] = useState(60);
  const [medidaCaseira, setMedidaCaseira] = useState("1 bola");

  const pesoTotal = useMemo(() => ingredientes.reduce((soma, item) => soma + num(item.g), 0), [ingredientes]);

  const totais = useMemo(() => {
    const total = pesoTotal || 1;
    const calc = (campo) => ingredientes.reduce((soma, item) => soma + num(item.g) * num(item[campo]) / 100, 0) / total * 100;
    const custoTotal = ingredientes.reduce((soma, item) => soma + (num(item.g) / 1000) * num(item.custoKg), 0);

    const solidos = calc("solidos");
    const gordura = calc("gordura");
    const acucares = calc("acucares");
    const acucaresAdicionados = calc("acucaresAdicionados");
    const carboidratos = calc("carboidratos");
    const sngl = calc("sngl");
    const proteina = calc("proteina");
    const lactose = calc("lactose");
    const gorduraSaturada = calc("gorduraSaturada");
    const gorduraTrans = calc("gorduraTrans");
    const fibra = calc("fibra");
    const sodio = calc("sodio");
    const estabilizante = calc("estabilizante");
    const pod = calc("pod");
    const pac = calc("pac");
    const agua = 100 - solidos;
    const energia = carboidratos * 4 + proteina * 4 + gordura * 9 + fibra * 2;
    const rendimentoLiquidoKg = (pesoTotal / 1000) * (1 - num(perdaProcesso) / 100);
    const volumeFinalL = rendimentoLiquidoKg * (1 + num(overrun) / 100);

    return {
      solidos, gordura, acucares, acucaresAdicionados, carboidratos, sngl, proteina, lactose,
      gorduraSaturada, gorduraTrans, fibra, sodio, estabilizante, pod, pac, agua, energia,
      pontoCongelamento: pac * -0.055,
      custoTotal,
      custoKg: custoTotal / (pesoTotal / 1000 || 1),
      custoKgLiquido: custoTotal / (rendimentoLiquidoKg || 1),
      rendimentoLiquidoKg,
      volumeFinalL
    };
  }, [ingredientes, pesoTotal, perdaProcesso, overrun]);

  const fatorPorcao = num(porcao) / 100;
  const porcoesPorEmbalagem = pesoTotal > 0 && porcao > 0 ? pesoTotal / porcao : 0;

  const tabelaNutricional = [
    { nome: "Valor energético", chave: "energia", unidade: "kcal", por100: totais.energia, vd: vd.energia },
    { nome: "Carboidratos", chave: "carboidratos", unidade: "g", por100: totais.carboidratos, vd: vd.carboidratos },
    { nome: "Açúcares totais", chave: "acucares", unidade: "g", por100: totais.acucares, vd: null },
    { nome: "Açúcares adicionados", chave: "acucaresAdicionados", unidade: "g", por100: totais.acucaresAdicionados, vd: vd.acucaresAdicionados },
    { nome: "Proteínas", chave: "proteina", unidade: "g", por100: totais.proteina, vd: vd.proteina },
    { nome: "Gorduras totais", chave: "gordura", unidade: "g", por100: totais.gordura, vd: vd.gordura },
    { nome: "Gorduras saturadas", chave: "gorduraSaturada", unidade: "g", por100: totais.gorduraSaturada, vd: vd.gorduraSaturada },
    { nome: "Gorduras trans", chave: "gorduraTrans", unidade: "g", por100: totais.gorduraTrans, vd: null },
    { nome: "Fibras alimentares", chave: "fibra", unidade: "g", por100: totais.fibra, vd: vd.fibra },
    { nome: "Sódio", chave: "sodio", unidade: "mg", por100: totais.sodio, vd: vd.sodio }
  ];

  function valorPorcao(item) { return item.por100 * fatorPorcao; }
  function percentualVD(item) { return item.vd ? arred((valorPorcao(item) / item.vd) * 100) + "%" : "—"; }

  function atualizar(id, campo, valor) {
    setIngredientes(lista => lista.map(item => item.id === id ? {
      ...item,
      [campo]: campo === "nome" ? valor : Number(valor)
    } : item));
  }

  function adicionarIngrediente() {
    setIngredientes(lista => [...lista, {
      id: Date.now(), nome: "Novo ingrediente", g: 0, custoKg: 0, solidos: 0, carboidratos: 0,
      acucares: 0, acucaresAdicionados: 0, gordura: 0, gorduraSaturada: 0, gorduraTrans: 0,
      proteina: 0, lactose: 0, sngl: 0, fibra: 0, sodio: 0, estabilizante: 0, pod: 0, pac: 0
    }]);
  }

  function removerIngrediente(id) { setIngredientes(lista => lista.filter(item => item.id !== id)); }

  function escalarReceita(novoPeso) {
    const atual = pesoTotal || 1;
    const fator = novoPeso / atual;
    setIngredientes(lista => lista.map(item => ({ ...item, g: Math.round(num(item.g) * fator * 10) / 10 })));
  }

  function resetar() {
    setNomeReceita("Base branca cremosa");
    setIngredientes(ingredientesIniciais);
    setPerdaProcesso(3);
    setOverrun(35);
    setLoteDesejado(10000);
    setPorcao(60);
    setMedidaCaseira("1 bola");
  }

  function importarExcel(event) {
    const arquivo = event.target.files && event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
      try {
        const dados = new Uint8Array(e.target.result);
        const workbook = XLSX.read(dados, { type: "array" });
        const primeiraAba = workbook.SheetNames[0];
        const planilha = workbook.Sheets[primeiraAba];
        const linhas = XLSX.utils.sheet_to_json(planilha, { defval: "" });

        const ingredientesImportados = linhas
          .map((linha, index) => converterLinhaExcel(linha, index))
          .filter(item => item.nome && item.nome !== "Ingrediente" && num(item.g) > 0);

        if (ingredientesImportados.length === 0) {
          alert("Não encontrei ingredientes válidos. Confira se a planilha tem colunas como Ingrediente e g.");
          return;
        }

        setIngredientes(ingredientesImportados);
        setNomeReceita(arquivo.name.replace(/\.(xlsx|xls|csv)$/i, ""));
      } catch (erro) {
        alert("Erro ao importar a planilha. Verifique se o arquivo está em formato .xlsx ou .xls.");
      }
    };

    leitor.readAsArrayBuffer(arquivo);
    event.target.value = "";
  }

  function gerarDadosExportacao() {
    const linhasIngredientes = ingredientes.map(i => [
      i.nome, i.g, i.custoKg, i.solidos, i.carboidratos, i.acucares, i.acucaresAdicionados,
      i.gordura, i.gorduraSaturada, i.gorduraTrans, i.proteina, i.lactose, i.sngl,
      i.fibra, i.sodio, i.estabilizante, i.pod, i.pac
    ]);

    const linhasResumo = [
      ["Peso total", `${fmt(pesoTotal)} g`],
      ["Custo total", `R$ ${fmt(totais.custoTotal)}`],
      ["Custo/kg calda", `R$ ${fmt(totais.custoKg)}`],
      ["Custo/kg líquido", `R$ ${fmt(totais.custoKgLiquido)}`],
      ["Rendimento líquido", `${fmt(totais.rendimentoLiquidoKg)} kg`],
      ["Volume com overrun", `${fmt(totais.volumeFinalL)} L`],
      ["Porção", `${porcao} g (${medidaCaseira})`]
    ];

    const linhasNutricionais = tabelaNutricional.map(i => [
      i.nome,
      `${i.unidade === "mg" ? arred(i.por100) : fmt(i.por100)} ${i.unidade}`,
      `${i.unidade === "mg" ? arred(valorPorcao(i)) : fmt(valorPorcao(i))} ${i.unidade}`,
      percentualVD(i)
    ]);

    return { linhasIngredientes, linhasResumo, linhasNutricionais };
  }

  function exportarCSV() {
    const { linhasIngredientes, linhasResumo, linhasNutricionais } = gerarDadosExportacao();
    const cabecalho = "Ingrediente;g;Custo/kg;Solidos;Carboidratos;Acucares totais;Acucares adicionados;Gordura;Gordura saturada;Gordura trans;Proteina;Lactose;SNGL;Fibra;Sodio;Estabilizante;POD;PAC";
    const linhas = linhasIngredientes.map(linha => linha.join(";"));
    const resumo = ["", "RESUMO", ...linhasResumo.map(l => l.join(";")), "", "TABELA NUTRICIONAL", "Nutriente;100 g;Porcao;%VD", ...linhasNutricionais.map(l => l.join(";"))];
    const csv = [cabecalho, ...linhas, ...resumo].join(String.fromCharCode(10));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    baixarArquivo(blob, `${nomeReceita.replace(/[^a-z0-9]+/gi, "-")}.csv`);
  }

  function baixarArquivo(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  function tabelaHtml(titulo, cabecalhos, linhas) {
    return `
      <h2>${titulo}</h2>
      <table>
        <thead><tr>${cabecalhos.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    `;
  }

  function exportarXLS() {
    const { linhasIngredientes, linhasResumo, linhasNutricionais } = gerarDadosExportacao();
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #172033; }
            h2 { margin-top: 24px; color: #172033; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
            th { background: #edf2f7; font-weight: bold; }
            th, td { border: 1px solid #94a3b8; padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>${nomeReceita}</h1>
          ${tabelaHtml("Receita", ["Ingrediente", "g", "Custo/kg", "Sólidos", "Carboidratos", "Açúcares totais", "Açúcares adicionados", "Gordura", "Gordura saturada", "Gordura trans", "Proteína", "Lactose", "SNGL", "Fibra", "Sódio", "Estabilizante", "POD", "PAC"], linhasIngredientes)}
          ${tabelaHtml("Resumo industrial", ["Indicador", "Valor"], linhasResumo)}
          ${tabelaHtml("Tabela nutricional estimada", ["Nutriente", "100 g", "Porção", "%VD"], linhasNutricionais)}
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    baixarArquivo(blob, `${nomeReceita.replace(/[^a-z0-9]+/gi, "-")}.xls`);
  }

  function exportarPDF() {
    const { linhasIngredientes, linhasResumo, linhasNutricionais } = gerarDadosExportacao();
    const html = `
      <html>
        <head>
          <title>${nomeReceita}</title>
          <meta charset="UTF-8" />
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: Arial, sans-serif; color: #172033; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            h2 { margin: 18px 0 8px; font-size: 16px; }
            p { color: #526173; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 12px; font-size: 10px; }
            th { background: #edf2f7; }
            th, td { border: 1px solid #94a3b8; padding: 5px; text-align: left; }
            .alerta { display: inline-block; background: #111827; color: #fff; padding: 8px 10px; border-radius: 8px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>${nomeReceita}</h1>
          <p>Relatório gerado pelo Balanceador de Caldas. Porção: ${porcao} g (${medidaCaseira}).</p>
          ${alertaFrontal.length > 0 ? `<div class="alerta">${alertaFrontal.join(" • ")}</div>` : ""}
          ${tabelaHtml("Resumo industrial", ["Indicador", "Valor"], linhasResumo)}
          ${tabelaHtml("Tabela nutricional estimada", ["Nutriente", "100 g", "Porção", "%VD"], linhasNutricionais)}
          ${tabelaHtml("Receita", ["Ingrediente", "g", "Custo/kg", "Sólidos", "Carboidratos", "Açúcares totais", "Açúcares adicionados", "Gordura", "Gordura saturada", "Gordura trans", "Proteína", "Lactose", "SNGL", "Fibra", "Sódio", "Estabilizante", "POD", "PAC"], linhasIngredientes)}
          <p>Observação: tabela nutricional estimada. Validar com ficha técnica, laudo ou software regulatório antes de impressão comercial.</p>
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>
    `;
    const janela = window.open("", "_blank");
    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  }

  const alertaFrontal = [];
  if (totais.acucaresAdicionados >= 15) alertaFrontal.push("ALTO EM AÇÚCARES ADICIONADOS");
  if (totais.gorduraSaturada >= 6) alertaFrontal.push("ALTO EM GORDURA SATURADA");
  if (totais.sodio >= 600) alertaFrontal.push("ALTO EM SÓDIO");

  const parecer = [];
  if (totais.solidos < faixas.solidos[0]) parecer.push("Sólidos baixos: tendência de calda mais aquosa, menor corpo e maior risco de cristais de gelo.");
  if (totais.solidos > faixas.solidos[1]) parecer.push("Sólidos altos: produto pode ficar pesado, denso e com menor sensação de frescor.");
  if (totais.gordura < faixas.gordura[0]) parecer.push("Gordura baixa: menor cremosidade e menor sensação de corpo.");
  if (totais.gordura > faixas.gordura[1]) parecer.push("Gordura alta: pode deixar o produto pesado e mascarar sabor.");
  if (totais.sngl < faixas.sngl[0]) parecer.push("SNGL baixo: pode reduzir corpo, estrutura e estabilidade da calda.");
  if (totais.sngl > faixas.sngl[1]) parecer.push("SNGL alto: pode aumentar risco de arenosidade, principalmente por excesso de lactose/minerais.");
  if (totais.proteina < faixas.proteina[0]) parecer.push("Proteína baixa: menor contribuição para corpo, emulsão e estabilidade.");
  if (totais.lactose > faixas.lactose[1]) parecer.push("Lactose alta: atenção ao risco de arenosidade/cristalização de lactose.");
  if (totais.estabilizante < faixas.estabilizante[0]) parecer.push("Estabilizante baixo: pode reduzir resistência ao derretimento e estabilidade no freezer.");
  if (totais.estabilizante > faixas.estabilizante[1]) parecer.push("Estabilizante alto: pode gerar textura gomosa ou artificial.");
  if (totais.pac < faixas.pac[0]) parecer.push("PAC baixo: tendência de endurecer demais no freezer.");
  if (totais.pac > faixas.pac[1]) parecer.push("PAC alto: tendência de ficar mole demais.");
  if (totais.pod < faixas.pod[0]) parecer.push("POD baixo: dulçor discreto, pode faltar percepção de sabor.");
  if (totais.pod > faixas.pod[1]) parecer.push("POD alto: dulçor elevado, pode ficar enjoativo.");
  if (alertaFrontal.length > 0) parecer.push("Rotulagem frontal provável: " + alertaFrontal.join(" • ") + ".");
  if (parecer.length === 0) parecer.push("Calda dentro de uma faixa equilibrada para uma base cremosa. Faça validação prática de maturação, batimento e freezer.");

  const cards = [
    ["Sólidos totais", totais.solidos, "%", faixas.solidos],
    ["Gordura", totais.gordura, "%", faixas.gordura],
    ["Açúcares", totais.acucares, "%", faixas.acucares],
    ["SNGL", totais.sngl, "%", faixas.sngl],
    ["Proteína", totais.proteina, "%", faixas.proteina],
    ["Lactose", totais.lactose, "%", faixas.lactose],
    ["Estabilizante", totais.estabilizante, "%", faixas.estabilizante],
    ["POD", totais.pod, "", faixas.pod],
    ["PAC", totais.pac, "", faixas.pac],
    ["Água estimada", totais.agua, "%", faixas.agua],
    ["Ponto congelamento", totais.pontoCongelamento, "°C", faixas.ponto],
    ["Custo total", totais.custoTotal, " R$", [0, 999999]],
    ["Custo/kg calda", totais.custoKg, " R$", [0, 999999]],
    ["Rendimento líquido", totais.rendimentoLiquidoKg, " kg", [0, 999999]],
    ["Volume com overrun", totais.volumeFinalL, " L", [0, 999999]]
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>Sorvete • Gelato • Balanceamento</div>
            <h1 style={styles.title}>Balanceador de Caldas 🍦</h1>
            <p style={styles.subtitle}>Agora sem SNF e com tabela nutricional estimada no modelo novo: por 100 g, por porção, %VD e alerta frontal.</p>
            <input style={styles.recipeInput} value={nomeReceita} onChange={(e) => setNomeReceita(e.target.value)} />
            <div style={styles.industrialGrid}>
              <label style={styles.label}>Lote desejado (g)<input style={styles.smallInput} type="number" value={loteDesejado} onChange={(e) => setLoteDesejado(Number(e.target.value))} /></label>
              <label style={styles.label}>Perda processo (%)<input style={styles.smallInput} type="number" value={perdaProcesso} onChange={(e) => setPerdaProcesso(Number(e.target.value))} /></label>
              <label style={styles.label}>Overrun (%)<input style={styles.smallInput} type="number" value={overrun} onChange={(e) => setOverrun(Number(e.target.value))} /></label>
              <label style={styles.label}>Porção (g)<input style={styles.smallInput} type="number" value={porcao} onChange={(e) => setPorcao(Number(e.target.value))} /></label>
              <label style={styles.label}>Medida caseira<input style={styles.smallInput} value={medidaCaseira} onChange={(e) => setMedidaCaseira(e.target.value)} /></label>
              <button style={styles.primaryButton} onClick={() => escalarReceita(loteDesejado)}>Aplicar lote</button>
            </div>
          </div>

          <div style={styles.totalBox}>
            <div style={styles.smallLabel}>Peso total da receita</div>
            <div style={styles.totalWeight}>{fmt(pesoTotal)} g</div>
            <div style={styles.buttonRow}>
              <button style={styles.button} onClick={() => escalarReceita(1000)}>1 kg</button>
              <button style={styles.button} onClick={() => escalarReceita(5000)}>5 kg</button>
              <button style={styles.button} onClick={() => escalarReceita(10000)}>10 kg</button>
              <button style={styles.buttonLight} onClick={resetar}>Reset</button>
              <label style={styles.uploadButton}>
                Upload Excel
                <input type="file" accept=".xlsx,.xls" onChange={importarExcel} style={{ display: "none" }} />
              </label>
              <button style={styles.primaryButton} onClick={exportarCSV}>Exportar CSV</button>
              <button style={styles.primaryButton} onClick={exportarXLS}>Baixar XLS editável</button>
              <button style={styles.primaryButton} onClick={exportarPDF}>Baixar PDF</button>
            </div>
          </div>
        </header>

        <section style={styles.cards}>
          {cards.map(([titulo, valor, unidade, faixa]) => (
            <div key={titulo} style={{...styles.card, borderLeft: `7px solid ${corStatus(valor, faixa)}`}}>
              <div style={styles.cardTitle}>{titulo}</div>
              <div style={styles.cardValue}>{fmt(valor)}{unidade}</div>
              <div style={styles.cardFooter}>Alvo: {faixa[0]} a {faixa[1]}{unidade} • {textoStatus(valor, faixa)}</div>
            </div>
          ))}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.h2}>Receita</h2>
            <button style={styles.primaryButton} onClick={adicionarIngrediente}>+ Adicionar ingrediente</button>
          </div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ingrediente</th>
                  <th style={styles.th}>g</th>
                  <th style={styles.th}>Custo/kg R$</th>
                  <th style={styles.th}>Sólidos %</th>
                  <th style={styles.th}>Carboidratos %</th>
                  <th style={styles.th}>Açúcares totais %</th>
                  <th style={styles.th}>Açúcares adicionados %</th>
                  <th style={styles.th}>Gordura %</th>
                  <th style={styles.th}>Gord. saturada %</th>
                  <th style={styles.th}>Gord. trans %</th>
                  <th style={styles.th}>Proteína %</th>
                  <th style={styles.th}>Lactose %</th>
                  <th style={styles.th}>SNGL %</th>
                  <th style={styles.th}>Fibra %</th>
                  <th style={styles.th}>Sódio mg/100g</th>
                  <th style={styles.th}>Estabilizante %</th>
                  <th style={styles.th}>POD</th>
                  <th style={styles.th}>PAC</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}><input style={styles.inputName} value={item.nome} onChange={(e) => atualizar(item.id, "nome", e.target.value)} /></td>
                    {["g", "custoKg", "solidos", "carboidratos", "acucares", "acucaresAdicionados", "gordura", "gorduraSaturada", "gorduraTrans", "proteina", "lactose", "sngl", "fibra", "sodio", "estabilizante", "pod", "pac"].map(campo => (
                      <td style={styles.td} key={campo}><input style={styles.inputNumber} type="number" value={item[campo]} onChange={(e) => atualizar(item.id, campo, e.target.value)} /></td>
                    ))}
                    <td style={styles.td}><button style={styles.deleteButton} onClick={() => removerIngrediente(item.id)}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.h2}>Tabela nutricional estimada</h2>
          <p style={styles.miniText}>Porções por embalagem: {fmt(porcoesPorEmbalagem)} • Porção: {porcao} g ({medidaCaseira})</p>
          {alertaFrontal.length > 0 && <div style={styles.alerta}>{alertaFrontal.join(" • ")}</div>}
          <div style={styles.tableWrap}>
            <table style={styles.nutriTable}>
              <thead>
                <tr>
                  <th style={styles.th}>INFORMAÇÃO NUTRICIONAL</th>
                  <th style={styles.th}>100 g</th>
                  <th style={styles.th}>{porcao} g</th>
                  <th style={styles.th}>%VD*</th>
                </tr>
              </thead>
              <tbody>
                {tabelaNutricional.map(item => (
                  <tr key={item.nome}>
                    <td style={styles.td}>{item.nome}</td>
                    <td style={styles.td}>{item.unidade === "mg" ? arred(item.por100) : fmt(item.por100)} {item.unidade}</td>
                    <td style={styles.td}>{item.unidade === "mg" ? arred(valorPorcao(item)) : fmt(valorPorcao(item))} {item.unidade}</td>
                    <td style={styles.td}>{percentualVD(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={styles.miniText}>*Percentual de valores diários fornecidos pela porção. Estimativa técnica: valide com ficha técnica, laudo ou software regulatório antes de imprimir rótulo comercial.</p>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.h2}>Parecer técnico</h2>
          {parecer.map((texto, index) => <p key={index} style={styles.note}>{texto}</p>)}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f3f6fb", minHeight: "100vh", padding: 24, fontFamily: "Arial, sans-serif", color: "#172033" },
  container: { maxWidth: 1500, margin: "0 auto" },
  header: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "end", marginBottom: 24 },
  badge: { display: "inline-block", background: "#172033", color: "white", padding: "8px 13px", borderRadius: 999, fontSize: 13, fontWeight: "bold" },
  title: { fontSize: 46, margin: "14px 0 10px", lineHeight: 1.05 },
  subtitle: { color: "#526173", fontSize: 16, maxWidth: 900 },
  recipeInput: { padding: 12, borderRadius: 12, border: "1px solid #ccd6e3", width: 330, fontSize: 16 },
  industrialGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, alignItems: "end" },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#526173", fontWeight: "bold" },
  smallInput: { padding: 10, borderRadius: 10, border: "1px solid #ccd6e3", width: 135, fontSize: 14 },
  totalBox: { background: "white", border: "1px solid #dce4ef", borderRadius: 20, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" },
  smallLabel: { color: "#66758a", fontSize: 13 },
  totalWeight: { fontSize: 38, fontWeight: "bold", margin: "8px 0 14px" },
  buttonRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  button: { background: "#eaf0f7", border: 0, borderRadius: 10, padding: "10px 13px", fontWeight: "bold", cursor: "pointer" },
  buttonLight: { background: "#fff3cd", border: 0, borderRadius: 10, padding: "10px 13px", fontWeight: "bold", cursor: "pointer" },
  primaryButton: { background: "#172033", color: "white", border: 0, borderRadius: 10, padding: "11px 14px", fontWeight: "bold", cursor: "pointer" },
  uploadButton: { background: "#0f766e", color: "white", border: 0, borderRadius: 10, padding: "11px 14px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  cards: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 },
  card: { background: "white", border: "1px solid #dce4ef", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.04)" },
  cardTitle: { color: "#526173", fontSize: 14 },
  cardValue: { fontSize: 26, fontWeight: "bold", margin: "6px 0" },
  cardFooter: { color: "#66758a", fontSize: 12 },
  panel: { background: "white", border: "1px solid #dce4ef", borderRadius: 20, padding: 18, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
  h2: { margin: "0 0 14px", fontSize: 24 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 2100 },
  nutriTable: { width: "100%", borderCollapse: "collapse", minWidth: 650 },
  th: { background: "#edf2f7", padding: 10, textAlign: "left", color: "#334155", fontSize: 14, whiteSpace: "nowrap" },
  td: { borderTop: "1px solid #e2e8f0", padding: 8 },
  inputName: { width: "100%", minWidth: 220, padding: 9, borderRadius: 8, border: "1px solid #ccd6e3" },
  inputNumber: { width: "100%", minWidth: 82, padding: 9, borderRadius: 8, border: "1px solid #ccd6e3", textAlign: "right" },
  deleteButton: { background: "#fee2e2", color: "#991b1b", border: 0, borderRadius: 8, padding: "9px 11px", fontWeight: "bold", cursor: "pointer" },
  note: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, color: "#334155", margin: "8px 0" },
  alerta: { display: "inline-block", background: "#111827", color: "white", fontWeight: "bold", padding: "10px 14px", borderRadius: 12, margin: "0 0 12px" },
  miniText: { color: "#526173", fontSize: 13 }
};

createRoot(document.getElementById("root")).render(<App />);
