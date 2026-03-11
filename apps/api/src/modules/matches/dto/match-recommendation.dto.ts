import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";
import { EducationType, SchoolLevel } from "@prisma/client";

function toArray(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  const result: string[] = [];

  for (const item of values) {
    const parts = String(item)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    result.push(...parts);
  }

  return result;
}

function toEnumArray(value: unknown) {
  return toArray(value).map((item) => item.toUpperCase());
}

function toPriorityArray(value: unknown) {
  return toArray(value).map((item) => item.slice(0, 48));
}

function toOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

export class MatchRecommendationDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(18)
  childAge?: number = 8;

  @IsOptional()
  @Transform(({ value }) => toOptionalString(value)?.toUpperCase())
  @IsEnum(SchoolLevel)
  educationLevel?: SchoolLevel = SchoolLevel.PRIMARIA;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(80)
  maxDistanceKm?: number = 12;

  @IsOptional()
  @Transform(({ value }) => toEnumArray(value))
  @IsArray()
  @ArrayMaxSize(8)
  @IsEnum(EducationType, { each: true })
  preferredTypes?: EducationType[] = [];

  @IsOptional()
  @Transform(({ value }) => toPriorityArray(value))
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  priorities?: string[] = [];

  @IsOptional()
  @Transform(({ value }) => toOptionalString(value))
  @IsString()
  queryText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 8;
}
