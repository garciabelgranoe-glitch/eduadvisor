export type Student = {
  id: string;
  fullName: string;
  courseDivision: string;
};

export type Activity = {
  id: string;
  name: string;
  dateLabel: string;
  location: string;
  priceArs: number;
  slotsLeft: number;
  description: string;
};

export type Enrollment = {
  id: string;
  studentId: string;
  studentName: string;
  activityName: string;
  status: "confirmada" | "espera" | "cancelada";
  authorization: "pendiente" | "validada" | "rechazada";
  payment: "pendiente" | "parcial" | "pagado";
};

export type Charge = {
  id: string;
  studentName: string;
  concept: string;
  dueDate: string;
  totalArs: number;
  paidArs: number;
  status: "pendiente" | "parcial" | "pagado" | "vencido";
};

export type FamilyDocument = {
  id: string;
  studentName: string;
  label: string;
  status: "pendiente" | "recibido" | "validado" | "rechazado";
  updatedAt: string;
};

export const familyProfile = {
  guardianName: "Mariana Torres",
  schoolName: "Colegio Privado San Gabriel",
  cycleLabel: "Ciclo lectivo 2026"
};

export const students: Student[] = [
  { id: "stu_01", fullName: "Sofía Ramírez", courseDivision: "5to A - Primaria" },
  { id: "stu_02", fullName: "Tomás Ramírez", courseDivision: "2do B - Secundaria" }
];

export const activities: Activity[] = [
  {
    id: "ed_01",
    name: "Salida al Museo de Ciencias",
    dateLabel: "20 de mayo, 08:00 a 13:00",
    location: "Museo Provincial de Ciencias",
    priceArs: 13000,
    slotsLeft: 4,
    description: "Visita guiada con taller práctico y transporte incluido."
  },
  {
    id: "ed_02",
    name: "Campamento de Integración",
    dateLabel: "5 y 6 de junio",
    location: "Predio El Challao",
    priceArs: 28000,
    slotsLeft: 12,
    description: "Actividad de convivencia, deportes y dinámica de equipos."
  },
  {
    id: "ed_03",
    name: "Taller de Robótica",
    dateLabel: "Todos los miércoles, 17:30",
    location: "Laboratorio STEM",
    priceArs: 0,
    slotsLeft: 7,
    description: "Espacio extracurricular sin cargo para proyectos con Arduino."
  }
];

export const enrollments: Enrollment[] = [
  {
    id: "enr_01",
    studentId: "stu_01",
    studentName: "Sofía Ramírez",
    activityName: "Salida al Museo de Ciencias",
    status: "confirmada",
    authorization: "pendiente",
    payment: "parcial"
  },
  {
    id: "enr_02",
    studentId: "stu_02",
    studentName: "Tomás Ramírez",
    activityName: "Campamento de Integración",
    status: "espera",
    authorization: "pendiente",
    payment: "pendiente"
  }
];

export const charges: Charge[] = [
  {
    id: "chg_01",
    studentName: "Sofía Ramírez",
    concept: "Salida al Museo de Ciencias",
    dueDate: "2026-05-10",
    totalArs: 13000,
    paidArs: 7000,
    status: "parcial"
  },
  {
    id: "chg_02",
    studentName: "Tomás Ramírez",
    concept: "Campamento de Integración",
    dueDate: "2026-05-15",
    totalArs: 28000,
    paidArs: 0,
    status: "pendiente"
  }
];

export const familyDocuments: FamilyDocument[] = [
  {
    id: "doc_01",
    studentName: "Sofía Ramírez",
    label: "Autorización firmada - Museo",
    status: "pendiente",
    updatedAt: "2026-04-04"
  },
  {
    id: "doc_02",
    studentName: "Tomás Ramírez",
    label: "Ficha médica actualizada",
    status: "validado",
    updatedAt: "2026-03-28"
  }
];

export const dashboardStats = {
  activeEnrollments: enrollments.filter((item) => item.status !== "cancelada").length,
  pendingPayments: charges.filter((item) => item.status === "pendiente" || item.status === "parcial").length,
  pendingDocs: familyDocuments.filter((item) => item.status === "pendiente" || item.status === "rechazado").length,
  availableActivities: activities.length
};
