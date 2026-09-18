import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--page)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface-1)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:px-6">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Precio de la vivienda en Madrid, barrio a barrio
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Evolución del precio medio de venta (€/m²) por barrio y del alquiler por distrito.
            Fuente: Ayuntamiento de Madrid, Estadística municipal (2001–2016).
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Dashboard />
      </main>
      <footer className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--text-muted)] sm:px-6">
        Datos de precios y límites administrativos: Ayuntamiento de Madrid. Ver{" "}
        <code className="rounded bg-[var(--gridline)] px-1 py-0.5">README.md</code> para cómo
        actualizar con datos más recientes.
      </footer>
    </div>
  );
}
