import { registerSW } from "virtual:pwa-register"
import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "leaflet/dist/leaflet.css"
import "./index.css"
import App from "./App"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

function InstallableApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standalone) {
      setIsInstalled(true)
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  return (
    <>
      <App />

      {!isInstalled && (
        <button
          type="button"
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt()
              await deferredPrompt.userChoice
              return
            }

            alert("دخل من menu ديال المتصفح → Add to Home screen أو Install app")
          }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: "18px",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#06142f",
            color: "#ffffff",
            border: "none",
            borderRadius: "999px",
            padding: "14px 22px",
            fontWeight: 800,
            fontSize: "14px",
            boxShadow: "0 12px 30px rgba(6,20,47,0.24)",
          }}
        >
          تثبيت التطبيق
        </button>
      )}
    </>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstallableApp />
  </StrictMode>,
)

registerSW({
  immediate: true,
  onRegisteredSW() {
    console.log("PWA ready")
  },
})
