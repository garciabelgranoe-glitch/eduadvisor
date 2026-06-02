import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { dashboardStats, enrollments, activities } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Resumen de familia"
        description="Estado operativo de inscripciones, pagos y documentación de tus hijos."
      />

      <section className="kpi-grid">
        <article className="kpi-card">
          <p>Inscripciones activas</p>
          <strong>{dashboardStats.activeEnrollments}</strong>
        </article>
        <article className="kpi-card">
          <p>Pagos pendientes</p>
          <strong>{dashboardStats.pendingPayments}</strong>
        </article>
        <article className="kpi-card">
          <p>Documentos pendientes</p>
          <strong>{dashboardStats.pendingDocs}</strong>
        </article>
        <article className="kpi-card">
          <p>Actividades abiertas</p>
          <strong>{dashboardStats.availableActivities}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>Próximos pasos sugeridos</h2>
        <ul className="action-list">
          <li>
            Subir autorización firmada de <strong>Sofía Ramírez</strong> para la salida al museo.
          </li>
          <li>
            Completar pago parcial pendiente de <strong>ARS 6.000</strong>.
          </li>
          <li>
            Revisar estado de lista de espera de <strong>Tomás Ramírez</strong>.
          </li>
        </ul>
      </section>

      <section className="split-grid">
        <article className="panel">
          <h2>Inscripciones recientes</h2>
          <div className="stack-sm">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="list-item">
                <p>{enrollment.studentName}</p>
                <span>{enrollment.activityName}</span>
              </div>
            ))}
          </div>
          <Link href="/inscripciones" className="text-link">
            Ver todas las inscripciones
          </Link>
        </article>

        <article className="panel">
          <h2>Actividades disponibles</h2>
          <div className="stack-sm">
            {activities.slice(0, 2).map((activity) => (
              <div key={activity.id} className="list-item">
                <p>{activity.name}</p>
                <span>{activity.dateLabel}</span>
              </div>
            ))}
          </div>
          <Link href="/actividades" className="text-link">
            Explorar actividades
          </Link>
        </article>
      </section>
    </div>
  );
}
