import { SectionHeader } from "@/components/section-header";
import { students, enrollments } from "@/lib/mock-data";

export default function ChildrenPage() {
  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Mis hijos"
        description="Información académica y estado operativo por alumno."
      />

      <section className="stack-md">
        {students.map((student) => {
          const items = enrollments.filter((entry) => entry.studentId === student.id);
          return (
            <article key={student.id} className="panel">
              <h2>{student.fullName}</h2>
              <p className="muted">{student.courseDivision}</p>
              <div className="stack-sm">
                {items.length === 0 ? (
                  <p className="muted">Sin inscripciones activas.</p>
                ) : (
                  items.map((entry) => (
                    <div key={entry.id} className="list-item">
                      <p>{entry.activityName}</p>
                      <span>Estado: {entry.status}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
