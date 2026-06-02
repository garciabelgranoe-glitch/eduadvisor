import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { charges } from "@/lib/mock-data";
import { formatArs } from "@/lib/format";

const paymentTone = {
  pendiente: "warn",
  parcial: "info",
  pagado: "ok",
  vencido: "danger"
} as const;

export default function PaymentsPage() {
  const total = charges.reduce((acc, charge) => acc + charge.totalArs, 0);
  const paid = charges.reduce((acc, charge) => acc + charge.paidArs, 0);
  const pending = total - paid;

  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Pagos"
        description="Estado de deuda y pagos por actividad de cada alumno."
      />

      <section className="kpi-grid">
        <article className="kpi-card">
          <p>Total esperado</p>
          <strong>{formatArs(total)}</strong>
        </article>
        <article className="kpi-card">
          <p>Total abonado</p>
          <strong>{formatArs(paid)}</strong>
        </article>
        <article className="kpi-card">
          <p>Saldo pendiente</p>
          <strong>{formatArs(pending)}</strong>
        </article>
      </section>

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Concepto</th>
              <th>Vencimiento</th>
              <th>Total</th>
              <th>Abonado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr key={charge.id}>
                <td>{charge.studentName}</td>
                <td>{charge.concept}</td>
                <td>{charge.dueDate}</td>
                <td>{formatArs(charge.totalArs)}</td>
                <td>{formatArs(charge.paidArs)}</td>
                <td>
                  <StatusPill label={charge.status} tone={paymentTone[charge.status]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
