import "@/renderer/index.css";
import App from "@/renderer/app/app";
import { createRoot } from "react-dom/client";

// Render your React component instead
const root = createRoot(document.getElementById("app"));
root.render(<App />);
