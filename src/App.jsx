import React from "react";
import { createRoot } from "react-dom/client";

function App(){
  return <h1 style={{padding:20}}>App funcionando 🚀</h1>;
}

createRoot(document.getElementById("root")).render(<App />);
