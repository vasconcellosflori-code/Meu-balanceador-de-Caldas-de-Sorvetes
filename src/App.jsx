import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const ingredientesIniciais = [
  { id: 1, nome: "Água filtrada", g: 520, custoKg: 0.01, solidos: 0, gordura: 0, acucares: 0, snf: 0, sngl: 0, proteina: 0, lactose: 0, estabilizante: 0, pod: 0, pac: 0 },
  { id: 2, nome: "Açúcar cristal", g: 120, custoKg: 4.5, solidos: 100, gordura: 0, acucares: 100, snf: 0, sngl: 0, proteina: 0, lactose: 0, estabilizante: 0, pod: 100, pac: 100 },
  { id: 3, nome: "Dextrose", g: 45, custoKg: 8, solidos: 92, gordura: 0, acucares: 92, snf: 0, sngl: 0, proteina: 0, lactose: 0, estabilizante: 0, pod: 70, pac: 171 },
  { id: 4, nome: "Glucose líquida", g: 35, custoKg: 7, solidos: 80, gordura: 0, acucares: 65, snf: 0, sngl: 0, proteina: 0, lactose: 0, estabilizante: 0, pod: 45, pac: 75 },
  { id: 5, nome: "Leite integral", g: 160, custoKg: 4.2, solidos: 12, gordura: 3.2, acucares: 4.8, snf: 8.8, sngl: 8.8, proteina: 3.2, lactose: 4.8, estabilizante: 0, pod: 4.8, pac: 4.8 },
  { id: 6, nome: "Creme de leite 25%", g: 75, custoKg: 18, solidos: 31, gordura: 25, acucares: 3, snf: 6, sngl: 6, proteina: 2, lactose: 3, estabilizante: 0, pod: 3, pac: 3 },
  { id: 7, nome: "Leite em pó desnatado", g: 40, custoKg: 32, solidos: 96, gordura: 1, acucares: 52, snf: 95, sngl: 95, proteina: 34, lactose: 52, estabilizante: 0, pod: 52, pac: 52 },
  { id: 8, nome: "Estabilizante", g: 5, custoKg: 65, solidos: 100, gordura: 0, acucares: 0, snf: 0, sngl: 0, proteina: 0, lactose: 0, estabilizante: 100, pod: 0, pac: 0 }
];

const faixas = {
  solidos: [36, 42],
  gordura: [5, 10],
  acucares: [16, 22],
  snf: [8, 12],
  sngl: [8, 12],
  proteina: [3, 5],
  lactose: [4, 7],
  estabilizante: [0.3, 0.8],
  pod: [14, 18],
  pac: [20, 28],
  agua: [58, 64],
  ponto: [-1.6, -1.1]
};

function num(valor) {
  return Number(valor || 0);
}

function fmt(valor) {
  return Number(valor || 0).toFixed(1).replace(".", ",");
}

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

function App() {
  const [nomeReceita, setNomeReceita] = useState("Base branca cremosa");
  const [ingredientes, setIngredientes] = useState(ingredientesIniciais);
  const [perdaProcesso, setPerdaProcesso] = useState(3);
  const [overrun, setOverrun] = useState(35);
  const [loteDesejado, setLoteDesejado] = useState(10000);

  const pesoTotal = useMemo(() => {
    return ingredientes.reduce((soma, item) => soma + num(item.g), 0);
  }, [ingredientes]);

  const totais = useMemo(() => {
    const total = pesoTotal || 1;
    const calc = (campo) =>
      ingredientes.reduce((soma, item) => soma + num(item.g) * num(item[campo]) / 100, 0) / total * 100;

    const custoTotal = ingredientes.reduce((soma, item) => soma + (num(item.g) / 1000) * num(item.custoKg), 0);

    const solidos = calc("solidos");
    const gordura = calc("gordura");
    const acucares = calc("acucares");
    const snf = calc("snf");
    const sngl = calc("sngl");
    const proteina = calc("proteina");
    const lactose = calc("lactose");
    const estabilizante = calc("estabilizante");
    const pod = calc("pod");
    const pac = calc("pac");
    const agua = 100 - solidos;
    const rendimentoLiquidoKg = (pesoTotal / 1000) * (1 - num(perdaProcesso) / 100);
    const volumeFinalL = rendimentoLiquidoKg * (1 + num(overrun) / 100);

    return {
      solidos,
      gordura,
      acucares,
      snf,
      sngl,
      proteina,
      lactose,
      estabilizante,
      pod,
      pac,
      agua,
      pontoCongelamento: pac * -0.055,
      custoTotal,
      custoKg: custoTotal / (pesoTotal / 1000 || 1),
      custoKgLiquido: custoTotal / (rendimentoLiquidoKg || 1),
      rendimentoLiquidoKg,
      volumeFinalL
    };
  }, [ingredientes, pesoTotal, perdaProcesso, overrun]);

  function atualizar(id, campo, valor) {
    setIngredientes(lista =>
      lista.map(item =>
        item.id === id
          ? { ...item, [campo]: campo === "nome" ? valor : Number(valor) }
          : item
      )
    );
  }

  function adicionarIngrediente() {
    setIngredientes(lista => [
      ...lista,
      {
        id: Date.now(),
        nome: "Novo ingrediente",
        g: 0,
        custoKg: 0,
        solidos: 0,
        gordura: 0,
        acucares: 0,
        snf: 0,
        sngl: 0,
        proteina: 0,
        lactose: 0,
        estabilizante: 0,
        pod: 0,
        pac: 0
      }
    ]);
  }

  function removerIngrediente(id) {
    setIngredientes(lista => lista.filter(item => item.id !== id));
  }

  function escalarReceita(novoPeso) {
    const atual = pesoTotal || 1;
    const fator = novoPeso / atual;
    setIngredientes(lista =>
      lista.map(item => ({
        ...item,
        g: Math.round(num(item.g) * fator * 10) / 10
      }))
    );
  }

  function resetar() {
    setNomeReceita("Base branca cremosa");
    setIngredientes(ingredientesIniciais);
    setPerdaProcesso(3);
    setOverrun(35);
    setLoteDesejado(10000);
  }

  function exportarCSV() {
    const cabecalho = "Ingrediente;g;Custo/kg;Solidos;Gordura;Acucares;SNF;SNGL;Proteina;Lactose;Estabilizante;POD;PAC";
    const linhas = ingredientes.map(i =>
      [i.nome, i.g, i.custoKg, i.solidos, i.gordura, i.acucares, i.snf, i.sngl, i.proteina, i.lactose, i.estabilizante, i.pod, i.pac].join(";")
    );
    const resumo = [
      "",
      "RESUMO",
      `Peso total;${fmt(pesoTotal)} g`,
      `Custo total;R$ ${fmt(totais.custoTotal)}`,
      `Custo/kg;R$ ${fmt(totais.custoKg)}`,
      `Rendimento liquido;${fmt(totais.rendimentoLiquidoKg)} kg`,
      `Volume final;${fmt(totais.volumeFinalL)} L`
    ];

    const csv = [cabecalho, ...linhas, ...resumo].join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nomeReceita.replace(/[^a-z0-9]+/gi, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
  if (parecer.length === 0) parecer.push("Calda dentro de uma faixa equilibrada para uma base cremosa. Faça validação prática de maturação, batimento e freezer.");

  const cards = [
    ["Sólidos totais", totais.solidos, "%", faixas.solidos],
    ["Gordura", totais.gordura, "%", faixas.gordura],
    ["Açúcares", totais.acucares, "%", faixas.acucares],
    ["SNF", totais.snf, "%", faixas.snf],
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
            <p style={styles.subtitle}>Ajuste ingredientes, peso, sólidos, gordura, SNGL, proteína, lactose, POD e PAC. O app recalcula automaticamente e gera um parecer técnico simples.</p>
            <input style={styles.recipeInput} value={nomeReceita} onChange={(e) => setNomeReceita(e.target.value)} />

            <div style={styles.industrialGrid}>
              <label style={styles.label}>Lote desejado (g)
                <input style={styles.smallInput} type="number" value={loteDesejado} onChange={(e) => setLoteDesejado(Number(e.target.value))} />
              </label>
              <label style={styles.label}>Perda processo (%)
                <input style={styles.smallInput} type="number" value={perdaProcesso} onChange={(e) => setPerdaProcesso(Number(e.target.value))} />
              </label>
              <label style={styles.label}>Overrun (%)
                <input style={styles.smallInput} type="number" value={overrun} onChange={(e) => setOverrun(Number(e.target.value))} />
              </label>
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
              <button style={styles.primaryButton} onClick={exportarCSV}>Exportar CSV</button>
            </div>
          </div>
        </header>

        <section style={styles.cards}>
          {cards.map(([titulo, valor, unidade, faixa]) => (
            <div key={titulo} style={{ ...styles.card, borderLeft: `7px solid ${corStatus(valor, faixa)}` }}>
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
                  <th style={styles.th}>Gordura %</th>
                  <th style={styles.th}>Açúcares %</th>
                  <th style={styles.th}>SNF %</th>
                  <th style={styles.th}>SNGL %</th>
                  <th style={styles.th}>Proteína %</th>
                  <th style={styles.th}>Lactose %</th>
                  <th style={styles.th}>Estabilizante %</th>
                  <th style={styles.th}>POD</th>
                  <th style={styles.th}>PAC</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <input style={styles.inputName} value={item.nome} onChange={(e) => atualizar(item.id, "nome", e.target.value)} />
                    </td>
                    {["g", "custoKg", "solidos", "gordura", "acucares", "snf", "sngl", "proteina", "lactose", "estabilizante", "pod", "pac"].map(campo => (
                      <td style={styles.td} key={campo}>
                        <input style={styles.inputNumber} type="number" value={item[campo]} onChange={(e) => atualizar(item.id, campo, e.target.value)} />
                      </td>
                    ))}
                    <td style={styles.td}>
                      <button style={styles.deleteButton} onClick={() => removerIngrediente(item.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.h2}>Parecer técnico</h2>
          {parecer.map((texto, index) => (
            <p key={index} style={styles.note}>{texto}</p>
          ))}
        </section>

        <section style={styles.panel}>
          <h2 style={styles.h2}>Como usar</h2>
          <p style={styles.note}>1. Ajuste os gramas de cada ingrediente. 2. Preencha custo/kg e parâmetros conforme ficha técnica. 3. Controle SNGL, proteína, lactose, estabilizante, POD, PAC, sólidos, gordura e água. 4. Use lote desejado, perda de processo e overrun para estimar rendimento industrial e custo real.</p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f3f6fb", minHeight: "100vh", padding: 24, fontFamily: "Arial, sans-serif", color: "#172033" },
  container: { maxWidth: 1400, margin: "0 auto" },
  header: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "end", marginBottom: 24 },
  badge: { display: "inline-block", background: "#172033", color: "white", padding: "8px 13px", borderRadius: 999, fontSize: 13, fontWeight: "bold" },
  title: { fontSize: 46, margin: "14px 0 10px", lineHeight: 1.05 },
  subtitle: { color: "#526173", fontSize: 16, maxWidth: 820 },
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
  cards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 },
  card: { background: "white", border: "1px solid #dce4ef", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.04)" },
  cardTitle: { color: "#526173", fontSize: 14 },
  cardValue: { fontSize: 28, fontWeight: "bold", margin: "6px 0" },
  cardFooter: { color: "#66758a", fontSize: 12 },
  panel: { background: "white", border: "1px solid #dce4ef", borderRadius: 20, padding: 18, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
  h2: { margin: "0 0 14px", fontSize: 24 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 1600 },
  th: { background: "#edf2f7", padding: 10, textAlign: "left", color: "#334155", fontSize: 14, whiteSpace: "nowrap" },
  td: { borderTop: "1px solid #e2e8f0", padding: 8 },
  inputName: { width: "100%", minWidth: 220, padding: 9, borderRadius: 8, border: "1px solid #ccd6e3" },
  inputNumber: { width: "100%", minWidth: 82, padding: 9, borderRadius: 8, border: "1px solid #ccd6e3", textAlign: "right" },
  deleteButton: { background: "#fee2e2", color: "#991b1b", border: 0, borderRadius: 8, padding: "9px 11px", fontWeight: "bold", cursor: "pointer" },
  note: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, color: "#334155", margin: "8px 0" }
};

createRoot(document.getElementById("root")).render(<App />);
