import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { enrollments } from "@/lib/mock-data";

const statusTone = {
  confirmada: "ok",
  espera: "warn",
  cancelada: "danger"
} as const;

const authTone = {
  pendiente: "warn",
  validada: "ok",
  rechazada: "danger"
} as const;

const paymentTone = {
  pendiente: "warn",
  parcial: "info",
  pagado: "ok"
} as const;

export default function EnrollmentsPage() {
  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Mis inscripciones"
        description="Seguimiento de estado, autorización y pago por actividad."
      />

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Actividad</th>
              <th>Inscripción</th>
              <th>Autorización</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((item) => (
              <tr key={item.id}>
                <td>{item.studentName}</td>
                <td>{item.activityName}</td>
                <td>
                  <StatusPill label={item.status} tone={statusTone[item.status]} />
                </td>
                <td>
                  <StatusPill label={item.authorization} tone={authTone[item.authorization]} />
                </td>
                <td>
                  <StatusPill label={item.payment} tone={paymentTone[item.payment]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
