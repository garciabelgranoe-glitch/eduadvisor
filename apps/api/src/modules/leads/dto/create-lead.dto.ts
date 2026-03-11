import { Type } from "class-transformer";
import { SchoolLevel } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class CreateLeadDto {
  @IsString()
  schoolId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  parentName!: string;

  @IsInt()
  @Type(() => Number)
  @Min(2)
  @Max(19)
  childAge!: number;

  @IsEnum(SchoolLevel)
  educationLevel!: SchoolLevel;

  @Matches(/^[0-9+()\s-]{7,20}$/)
  phone!: string;

  @IsEmail()
  email!: string;
}
