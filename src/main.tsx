import { createRoot } from "react-dom/client";
import { initDatabase } from "./services/database";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  try {
    await initDatabase();
  } catch (err) {
    console.error("[GAJIKU] Database init error:", err);
    // App still renders — hooks will show empty state gracefully
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
