import { Card } from "@/components/ui/card";
import { MetricTile } from "@/components/ui/metric-tile";
import { getLaunchReadinessSnapshot, type LaunchCheckStatus } from "@/lib/admin/launch-readiness";

export const dynamic = "force-dynamic";

function statusStyles(status: LaunchCheckStatus) {
  if (status === "PASS") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "WARN") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-red-200 bg-red-50 text-red-800";
}

function statusLabel(status: LaunchCheckStatus) {
  if (status === "PASS") {
    return "APROBADO";
  }

  if (status === "WARN") {
    return "ALERTA";
  }

  return "CRÍTICO";
}

export default async function AdminLaunchPage() {
  const snapshot = await getLaunchReadinessSnapshot();

  return (
    <section className="space-y-6">
      <Card className="space-y-2 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Control de lanzamiento</p>
        <h2 className="font-display text-3xl text-ink">Beta pública controlada</h2>
        <p className="text-sm text-slate-600">
          Modo actual: <span className="font-medium text-ink">{snapshot.launchMode}</span> · Actualizado:{" "}
          {new Date(snapshot.generatedAt).toLocaleString("es-AR")}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Estado general" value={statusLabel(snapshot.summary.status)} />
        <MetricTile label="Checks aprobados" value={String(snapshot.summary.pass)} />
        <MetricTile label="Checks con alerta" value={String(snapshot.summary.warn)} />
        <MetricTile label="Checks críticos" value={String(snapshot.summary.fail)} />
      </div>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-ink">Checklist operativo</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-slate-500">
                <th className="py-2 pr-3">Check</th>
                <th className="py-2 pr-3">Resultado</th>
                <th className="py-2 pr-3">Requerido</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2 pr-3">Detalle</th>
                <th className="py-2 pr-3">HTTP</th>
                <th className="py-2">Latencia</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.checks.map((check) => (
                <tr key={check.id} className="border-b border-brand-50 last:border-b-0">
                  <td className="py-2 pr-3 font-medium text-ink">{check.label}</td>
                  <td className="py-2 pr-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusStyles(check.status)}`}>
                      {statusLabel(check.status)}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{check.required ? "Sí" : "No"}</td>
                  <td className="py-2 pr-3 text-slate-600">{check.target}</td>
                  <td className="py-2 pr-3 text-slate-600">{check.message}</td>
                  <td className="py-2 pr-3 text-slate-600">{check.httpStatus ?? "-"}</td>
                  <td className="py-2 text-slate-600">{check.latencyMs === null ? "-" : `${check.latencyMs} ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">Recomendaciones go/no-go</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          {snapshot.recommendations.map((item, index) => (
            <li key={`${index}-${item}`}>• {item}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
