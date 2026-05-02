import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "sonner/dist/styles.css";
import "./styles/index.css";

const googleClientId =
  typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === "string" ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : "";

const tree = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
) : (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(tree);
  