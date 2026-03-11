import { IsString, MaxLength } from "class-validator";

export class UpdateSchoolReviewResponseDto {
  @IsString()
  schoolId!: string;

  @IsString()
  @MaxLength(1200)
  response!: string;
}
