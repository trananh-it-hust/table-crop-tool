import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@/styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
