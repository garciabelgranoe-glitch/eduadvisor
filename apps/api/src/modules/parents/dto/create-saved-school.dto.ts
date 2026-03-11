import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateSavedSchoolDto {
  @IsString()
  @MinLength(10)
  @MaxLength(64)
  schoolId!: string;
}
