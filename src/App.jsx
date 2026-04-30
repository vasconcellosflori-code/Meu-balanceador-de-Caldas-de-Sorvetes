import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const defaultIngredients = [
  { id: 1, name: "Água", grams: 600, solids: 0, fat: 0, sugar: 0, pod: 0, pac: 0 },
  { id: 2, name: "Açúcar", grams: 150, solids: 100, fat: 0, sugar: 100, pod: 100, pac: 100 },
  { id: 3, name: "Leite", grams: 200, solids: 12, fat: 3, sugar: 5, pod: 5, pac: 5 }
];

function App(){
  const [ingredients, setIngredients] = useState(defaultIngredients);

  const totals = useMemo(()=>{
    const total = ingredients.reduce((s,i)=>s+i.grams,0)||1;
    const calc = (key)=>ingredients.reduce((s,i)=>s+i.grams*i[key]/100,0)/total*100;
    return {
      solids: calc("solids"),
      fat: calc("fat"),
      pod: calc("pod"),
      pac: calc("pac")
    };
  },[ingredients]);

  function update(id, field, value){
    setIngredients(rows=>rows.map(r=>r.id===id?{...r,[field]:Number(value)}:r));
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
              <td>
                <input
                  type="number"
                  value={i.grams}
                  onChange={e=>update(i.id,"grams",e.target.value)}
                />
              </td>
              <td>{i.solids}</td>
              <td>{i.fat}</td>
              <td>{i.pod}</td>
              <td>{i.pac}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Resultados</h2>
      <p>Sólidos: {totals.solids.toFixed(1)}%</p>
      <p>Gordura: {totals.fat.toFixed(1)}%</p>
      <p>POD: {totals.pod.toFixed(1)}</p>
      <p>PAC: {totals.pac.toFixed(1)}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
