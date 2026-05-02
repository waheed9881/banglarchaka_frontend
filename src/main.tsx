import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { i18nReady } from "./i18n/config";
import App from "./app/App.tsx";
import { RootErrorBoundary } from "./app/components/RootErrorBoundary.tsx";
import "sonner/dist/styles.css";
import "./styles/index.css";

const googleClientId =
  typeof import.meta.env.VITE_GOOGLE_CLIENT_ID === "string" ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() : "";

const tree = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </BrowserRouter>
  </GoogleOAuthProvider>
) : (
  <BrowserRouter>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </BrowserRouter>
);

void i18nReady
  .then(() => {
    const el = document.getElementById("root");
    if (!el) {
      document.body.innerHTML =
        '<p style="font-family:sans-serif;padding:24px">Missing #root — index.html load issue.</p>';
      return;
    }
    createRoot(el).render(tree);
  })
  .catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    document.body.innerHTML = `<div style="font-family:sans-serif;padding:24px;max-width:560px">
      <h1 style="color:#b91c1c">i18n failed to start</h1>
      <p>${msg}</p>
    </div>`;
    console.error("[main] i18nReady rejected", e);
  });
