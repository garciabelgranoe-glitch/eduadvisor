import { formatCurrency } from "@/lib/format";

export function buildGeoIntro(params: {
  city: string;
  province: string;
  schoolCount: number;
  averageMonthlyFee: number | null;
}) {
  const { city, province, schoolCount, averageMonthlyFee } = params;

  return `Elegir colegio en ${city}, ${province}, requiere comparar más que una cuota mensual. En EduAdvisor analizamos oferta educativa real, niveles disponibles, reputación familiar y señales de demanda para ayudarte a filtrar opciones con criterio. Hoy ves ${schoolCount} colegios activos en esta zona, con una cuota promedio de ${formatCurrency(averageMonthlyFee)}. Este listado prioriza instituciones con información verificable, reviews recientes y datos útiles para tomar decisiones concretas.

Además del ranking general, te mostramos destacados con contexto, preguntas frecuentes locales y una guía práctica para evaluar ajuste pedagógico, logística diaria y presupuesto. Si recién empezás la búsqueda, usá esta página como mapa base; si ya tenés colegios en mente, compará perfiles y revisá fortalezas por nivel (inicial, primaria y secundaria). El objetivo es reducir ruido, evitar sesgos por marketing y darte una vista clara de qué alternativas encajan mejor con tu familia.`;
}

export function buildGeoFaq(params: { city: string; province: string }) {
  const { city, province } = params;

  return [
    {
      question: `¿Cuál es la cuota promedio de colegios privados en ${city}?`,
      answer: `La cuota varía por nivel, jornada y propuesta institucional. En esta landing mostramos promedios y rangos actualizados para ${city}.`
    },
    {
      question: `¿Qué nivel educativo tiene más oferta en ${city}?`,
      answer:
        "La distribución por nivel (inicial, primaria, secundaria) se calcula con colegios activos y te ayuda a detectar dónde hay mayor disponibilidad."
    },
    {
      question: `¿Cómo comparo colegios en ${city}, ${province}, sin perder contexto?`,
      answer:
        "Usá el comparador de EduAdvisor para revisar score, cuota, ratings y ubicación en una sola vista, y luego validá detalles en cada perfil."
    },
    {
      question: "¿Los reviews de EduAdvisor están moderados?",
      answer:
        "Sí. Las reseñas pasan por moderación editorial para reducir spam y priorizar experiencias concretas y útiles para otras familias."
    },
    {
      question: `¿Cada cuánto se actualizan los datos de ${city}?`,
      answer:
        "Las páginas geo se revalidan periódicamente para reflejar cambios en oferta, cuotas estimadas, reviews y señales de demanda local."
    }
  ];
}

export const geoChecklist = [
  "Definí presupuesto anual total (cuota + extras + transporte).",
  "Validá propuesta pedagógica y continuidad por nivel.",
  "Compará distancia, tiempos de traslado y seguridad de acceso.",
  "Revisá reputación en reviews verificadas y consistencia del rating.",
  "Confirmá vacantes reales y tiempos de respuesta del colegio."
];
