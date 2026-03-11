export type SchoolLevel = "INICIAL" | "PRIMARIA" | "SECUNDARIA";

export interface SchoolSearchFilters {
  country?: string;
  province?: string;
  city?: string;
  levels?: SchoolLevel[];
  feeMin?: number;
  feeMax?: number;
  minRating?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface MatchRequest {
  city?: string;
  childAge: number;
  budgetMin?: number;
  budgetMax?: number;
  educationLevel: SchoolLevel;
  maxDistanceKm?: number;
  priorities: string[];
}
