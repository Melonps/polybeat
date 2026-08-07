import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

createRoot(
  // biome-ignore lint/style/noNonNullAssertion: index.html always provides a #root element.
  document.getElementById("root")!,
).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
