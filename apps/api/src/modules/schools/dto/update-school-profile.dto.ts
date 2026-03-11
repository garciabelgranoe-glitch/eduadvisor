import { Type } from "class-transformer";
import { SchoolLevel } from "@prisma/client";
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf
} from "class-validator";

export class UpdateSchoolProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUrl({ require_tld: false })
  website?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  monthlyFeeEstimate?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  studentsCount?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(SchoolLevel, { each: true })
  levels?: SchoolLevel[];

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUrl({ require_tld: false })
  logoUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUrl({ require_tld: false }, { each: true })
  galleryUrls?: string[];
}
