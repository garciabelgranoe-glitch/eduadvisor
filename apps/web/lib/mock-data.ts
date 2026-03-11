export interface SchoolCardData {
  id: string;
  name: string;
  city: string;
  monthlyFee: number;
  rating: number;
  reviewCount: number;
  levels: string[];
  highlights: string[];
  distanceKm: number;
  eduAdvisorScore: number;
}

export const featuredSchools: SchoolCardData[] = [
  {
    id: "north-hills",
    name: "North Hills College",
    city: "Longchamps, Buenos Aires",
    monthlyFee: 285000,
    rating: 4.7,
    reviewCount: 164,
    levels: ["Inicial", "Primaria", "Secundaria"],
    highlights: ["Programa bilingue", "Jornada extendida", "STEM Lab"],
    distanceKm: 3.2,
    eduAdvisorScore: 91
  },
  {
    id: "san-lucas",
    name: "Colegio San Lucas",
    city: "Lomas de Zamora, Buenos Aires",
    monthlyFee: 210000,
    rating: 4.5,
    reviewCount: 112,
    levels: ["Primaria", "Secundaria"],
    highlights: ["Buen ingles", "Deportes competitivos", "Clima familiar"],
    distanceKm: 5.1,
    eduAdvisorScore: 86
  },
  {
    id: "rio-verde",
    name: "Instituto Rio Verde",
    city: "Adrogue, Buenos Aires",
    monthlyFee: 245000,
    rating: 4.8,
    reviewCount: 89,
    levels: ["Inicial", "Primaria"],
    highlights: ["Aprendizaje por proyectos", "Huerta escolar", "Arte"],
    distanceKm: 4.4,
    eduAdvisorScore: 88
  }
];

export const compareCandidates = featuredSchools.slice(0, 2);

export const rankingByCity = [
  { city: "Longchamps", topScore: 91, schools: 34 },
  { city: "Adrogue", topScore: 89, schools: 51 },
  { city: "Lomas de Zamora", topScore: 88, schools: 73 }
];

export const parentDashboardData = {
  savedSchools: 8,
  activeComparisons: 3,
  unreadAlerts: 2,
  nextOpenHouse: "Jueves 21:00 - North Hills College"
};

export const schoolDashboardData = {
  monthlyLeads: 42,
  conversionRate: 18.4,
  profileViews: 1840,
  averageResponseHours: 3.1
};
