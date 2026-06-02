import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { familyDocuments } from "@/lib/mock-data";

const docsTone = {
  pendiente: "warn",
  recibido: "info",
  validado: "ok",
  rechazado: "danger"
} as const;

export default function DocumentsPage() {
  return (
    <div className="stack-lg fade-in">
      <SectionHeader
        title="Documentos"
        description="Autorizaciones y archivos requeridos para validar participación."
      />

      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {familyDocuments.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.studentName}</td>
                <td>{doc.label}</td>
                <td>
                  <StatusPill label={doc.status} tone={docsTone[doc.status]} />
                </td>
                <td>{doc.updatedAt}</td>
                <td>
                  <button className="ghost-btn">Subir nueva versión</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
