"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es-AR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          padding: "48px 24px",
          fontFamily: "'Avenir Next', Avenir, 'Segoe UI', sans-serif",
          color: "#0f172a",
          background:
            "radial-gradient(800px 320px at 100% -10%, rgba(124, 197, 170, 0.2), transparent 60%), radial-gradient(600px 320px at -10% 20%, rgba(254, 215, 123, 0.25), transparent 55%), linear-gradient(180deg, #f8fbfb 0%, #ffffff 45%, #f8fbfb 100%)"
        }}
      >
        <main
          style={{
            maxWidth: 760,
            margin: "0 auto",
            borderRadius: 20,
            border: "1px solid #fde68a",
            background: "rgba(255, 251, 235, 0.92)",
            boxShadow: "0 16px 38px rgba(15, 23, 42, 0.08)",
            padding: 28,
            display: "grid",
            gap: 14
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#92400e"
            }}
          >
            Recuperación de vista
          </p>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15 }}>No pudimos renderizar esta vista</h1>
          <p style={{ margin: 0, fontSize: 14, color: "#334155" }}>
            La aplicación encontró un error crítico. Reintenta y, si persiste, reinicia el servidor local.
          </p>
          {error?.digest ? (
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>ID de error: {error.digest}</p>
          ) : null}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: 12,
                background: "#1f5c4d",
                color: "#ffffff",
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                background: "#ffffff",
                color: "#0f172a",
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Volver al inicio
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
