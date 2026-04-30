import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const ingredientesIniciais = [
  { id: 1, nome: "Água filtrada", g: 520, solidos: 0, gordura: 0, acucares: 0, snf: 0, sngl: 0, proteina: 0, lactose: 0, pod: 0, pac: 0 },
  { id: 2, nome: "Açúcar cristal", g: 120, solidos: 100, gordura: 0, acucares: 100, snf: 0, sngl: 0, proteina: 0, lactose: 0, pod: 100, pac: 100 },
  { id: 3, nome: "Dextrose", g: 45, solidos: 92, gordura: 0, acucares: 92, snf: 0, sngl: 0, proteina: 0, lactose: 0, pod: 70, pac: 171 },
  { id: 4, nome: "Leite integral", g: 160, solidos: 12, gordura: 3.2, acucares: 4.8, snf: 8.8, sngl: 8.8, proteina: 3.2, lactose: 4.8, pod: 4.8, pac: 4.8 }
];

function num(v){ return Number(v||0); }
function fmt(v){ return Number(v||0).toFixed(1); }

function App(){
  const [ingredientes,setIngredientes]=useState(ingredientesIniciais);

  const pesoTotal = useMemo(()=> ingredientes.reduce((s,i)=>s+num(i.g),0),[ingredientes]);

  const totais = useMemo(()=>{
    const total = pesoTotal || 1;
    const calc = campo => ingredientes.reduce((s,i)=>s+num(i.g)*num(i[campo])/100,0)/total*100;

    return {
      solidos: calc("solidos"),
      gordura: calc("gordura"),
      acucares: calc("acucares"),
      snf: calc("snf"),
      sngl: calc("sngl"),
      proteina: calc("proteina"),
      lactose: calc("lactose"),
      pod: calc("pod"),
      pac: calc("pac")
    };
  },[ingredientes,pesoTotal]);

  function atualizar(id,campo,valor){
    setIngredientes(lista=>lista.map(i=>i.id===id?{...i,[campo]:Number(valor)}:i));
  }

  return (
    <div style={{padding:20,fontFamily:"Arial"}}>
      <h1>Balanceador Avançado 🍦</h1>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th>g</th>
            <th>Sólidos</th>
            <th>Gordura</th>
            <th>Açúcar</th>
            <th>SNF</th>
            <th>SNGL</th>
            <th>Proteína</th>
            <th>Lactose</th>
            <th>POD</th>
            <th>PAC</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map(i=> (
            <tr key={i.id}>
              <td>{i.nome}</td>
              {Object.keys(i).filter(k=>k!=="id" && k!=="nome").map(c=> (
                <td key={c}>
                  <input type="number" value={i[c]} onChange={e=>atualizar(i.id,c,e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Resultados</h2>
      <p>Sólidos: {fmt(totais.solidos)}%</p>
      <p>Gordura: {fmt(totais.gordura)}%</p>
      <p>Açúcar: {fmt(totais.acucares)}%</p>
      <p>SNF: {fmt(totais.snf)}%</p>
      <p>SNGL: {fmt(totais.sngl)}%</p>
      <p>Proteína: {fmt(totais.proteina)}%</p>
      <p>Lactose: {fmt(totais.lactose)}%</p>
      <p>POD: {fmt(totais.pod)}</p>
      <p>PAC: {fmt(totais.pac)}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
