import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Eva from "./pages/Eva";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Eva brand="malu" standaloneBasePath="" />
  </BrowserRouter>,
);
