import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const baseIngredients = [
  { id: 1, name: "Água filtrada", grams: 520, solids: 0, fat: 0, sugar: 0, snf: 0, pod: 0, pac: 0 },
  { id: 2, name: "Açúcar cristal", grams: 120, solids: 100, fat: 0, sugar: 100, snf: 0, pod: 100, pac: 100 },
  { id: 3, name: "Dextrose", grams: 45, solids: 92, fat: 0, sugar: 92, snf: 0, pod: 70, pac: 171 }
];

const targets = {
  solids: [36, 42],
  fat: [5, 10],
  pod: [14, 18],
  pac: [20, 28]
};

function format(n){ return Number(n || 0).toFixed(1); }

function status(value, [min, max]){
  if(value < min) return "Baixo";
  if(value > max) return "Alto";
  return "OK";
}

function App(){
  const [ingredients, setIngredients] = useState(baseIngredients);

  const totalGrams = useMemo(() => 
    ingredients.reduce((sum, item) => sum + Number(item.grams || 0), 0),
    [ingredients]
  );

  const totals = useMemo(() => {
    const total = totalGrams || 1;
    const calc = key => ingredients.reduce(
      (sum, item) => sum + Number(item.grams || 0) * Number(item[key] || 0) / 100,
      0
    ) / total * 100;

    return {
      solids: calc("solids"),
      fat: calc("fat"),
      pod: calc("pod"),
      pac: calc("pac")
    };
  }, [ingredients, totalGrams]);

  function update(id, field, value){
    setIngredients(rows => rows.map(row => row.id === id ? {
      ...row,
      [field]: Number(value)
    } : row));
  }

  return (
    <div style={{padding:20,fontFamily:"Arial"}}>
      <h1>Balanceador de Caldas 🍦</h1>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th>g</th>
            <th>Sólidos</th>
            <th>Gordura</th>
            <th>POD</th>
            <th>PAC</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map(i=> (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td><input type="number" value={i.grams} onChange={e=>update(i.id,"grams",e.target.value)} /></td>
              <td>{i.solids}</td>
              <td>{i.fat}</td>
              <td>{i.pod}</td>
              <td>{i.pac}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Resultados</h2>
      <p>Sólidos: {format(totals.solids)}% ({status(totals.solids, targets.solids)})</p>
      <p>Gordura: {format(totals.fat)}% ({status(totals.fat, targets.fat)})</p>
      <p>POD: {format(totals.pod)}</p>
      <p>PAC: {format(totals.pac)}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
