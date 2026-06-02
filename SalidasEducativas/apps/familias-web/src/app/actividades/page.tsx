import { SectionHeader } from "@/components/section-header";
import { activities } from "@/lib/mock-data";
import { formatArs } from "@/lib/format";

export default function ActivitiesPage() {
  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Actividades disponibles"
        description="Oferta vigente para inscripción online por alumno elegible."
      />

      <section className="stack-md">
        {activities.map((activity) => (
          <article className="panel" key={activity.id}>
            <div className="panel-heading">
              <h2>{activity.name}</h2>
              <span className="badge">{activity.slotsLeft} cupos</span>
            </div>
            <p>{activity.description}</p>
            <div className="meta-grid">
              <div>
                <p className="muted">Fecha</p>
                <strong>{activity.dateLabel}</strong>
              </div>
              <div>
                <p className="muted">Lugar</p>
                <strong>{activity.location}</strong>
              </div>
              <div>
                <p className="muted">Precio</p>
                <strong>{activity.priceArs === 0 ? "Sin cargo" : formatArs(activity.priceArs)}</strong>
              </div>
            </div>
            <button className="cta">Inscribir ahora</button>
          </article>
        ))}
      </section>
    </div>
  );
}
