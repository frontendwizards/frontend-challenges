import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import reportAccessibility from "./utils/reportAccessibility.ts";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

reportAccessibility(React)