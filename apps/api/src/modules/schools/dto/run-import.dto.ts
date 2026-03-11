import { Type } from "class-transformer";
import { ImportSource } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class RunImportDto {
  @IsOptional()
  @IsEnum(ImportSource)
  source?: ImportSource = ImportSource.GOOGLE_PLACES;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  countryCode?: string = "AR";

  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxPages?: number = 3;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  fetchDetails?: boolean = true;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  useFixtureFallback?: boolean = false;
}
