import { AdminBillingTools } from "@/components/admin/admin-billing-tools";
import { Card } from "@/components/ui/card";
import { MetricTile } from "@/components/ui/metric-tile";
import {
  getAdminBillingInvoices,
  getAdminBillingOverview,
  getAdminBillingWebhookEvents,
  getAdminSchools
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const [overview, invoices, webhookEvents, schools] = await Promise.all([
    getAdminBillingOverview(),
    getAdminBillingInvoices({ page: "1", limit: "15" }),
    getAdminBillingWebhookEvents({ page: "1", limit: "15" }),
    getAdminSchools({ page: "1", limit: "100", sortBy: "name", sortOrder: "asc", status: "all" })
  ]);

  if (!overview) {
    return <Card className="text-sm text-slate-600">No se pudo cargar el módulo de facturación.</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricTile label="Subs activas" value={String(overview.kpis.activeSubscriptions)} />
        <MetricTile label="Subs en mora" value={String(overview.kpis.pastDueSubscriptions)} />
        <MetricTile label="MRR" value={`$${overview.kpis.mrr.toLocaleString("es-AR")}`} />
        <MetricTile label="Facturas pagas (30d)" value={String(overview.kpis.invoicesPaid30d)} />
        <MetricTile label="Revenue pagado (30d)" value={`$${overview.kpis.revenuePaid30d.toLocaleString("es-AR")}`} />
        <MetricTile label="Checkouts abiertos" value={String(overview.kpis.checkoutSessionsOpen)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Estado de facturación</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• DRAFT: {overview.invoices.byStatus.DRAFT}</li>
            <li>• OPEN: {overview.invoices.byStatus.OPEN}</li>
            <li>• PAID: {overview.invoices.byStatus.PAID}</li>
            <li>• VOID: {overview.invoices.byStatus.VOID}</li>
            <li>• UNCOLLECTIBLE: {overview.invoices.byStatus.UNCOLLECTIBLE}</li>
          </ul>
        </Card>
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">Estado de webhooks</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• RECEIVED: {overview.webhooks.byStatus.RECEIVED}</li>
            <li>• PROCESSED: {overview.webhooks.byStatus.PROCESSED}</li>
            <li>• FAILED: {overview.webhooks.byStatus.FAILED}</li>
            <li>• DUPLICATE: {overview.webhooks.byStatus.DUPLICATE}</li>
            <li>• IGNORED: {overview.webhooks.byStatus.IGNORED}</li>
          </ul>
        </Card>
      </div>

      <AdminBillingTools
        schools={schools.items.map((school) => ({
          id: school.id,
          name: school.name,
          slug: school.slug,
          city: school.city,
          province: school.province
        }))}
      />

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-brand-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-ink">Facturas recientes</h2>
        </div>
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-slate-500">Colegio</th>
              <th className="px-4 py-3 text-slate-500">Estado</th>
              <th className="px-4 py-3 text-slate-500">Monto</th>
              <th className="px-4 py-3 text-slate-500">Proveedor</th>
              <th className="px-4 py-3 text-slate-500">Emitida</th>
              <th className="px-4 py-3 text-slate-500">Pagada</th>
            </tr>
          </thead>
          <tbody>
            {invoices.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-50 last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{item.school.name}</p>
                  <p className="text-xs text-slate-500">/{item.school.slug}</p>
                </td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  {item.currency} {item.amountTotal.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">{item.provider}</td>
                <td className="px-4 py-3">{new Date(item.issuedAt).toLocaleString("es-AR")}</td>
                <td className="px-4 py-3">{item.paidAt ? new Date(item.paidAt).toLocaleString("es-AR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-brand-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-ink">Webhooks recientes</h2>
        </div>
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-slate-500">Evento</th>
              <th className="px-4 py-3 text-slate-500">Tipo</th>
              <th className="px-4 py-3 text-slate-500">Estado</th>
              <th className="px-4 py-3 text-slate-500">Colegio</th>
              <th className="px-4 py-3 text-slate-500">Firma</th>
              <th className="px-4 py-3 text-slate-500">Recibido</th>
            </tr>
          </thead>
          <tbody>
            {webhookEvents.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-50 last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{item.externalEventId}</p>
                  <p className="text-xs text-slate-500">{item.provider}</p>
                </td>
                <td className="px-4 py-3">{item.eventType}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{item.school ? item.school.name : "-"}</td>
                <td className="px-4 py-3">{item.signatureValid ? "OK" : "Inválida"}</td>
                <td className="px-4 py-3">{new Date(item.receivedAt).toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
