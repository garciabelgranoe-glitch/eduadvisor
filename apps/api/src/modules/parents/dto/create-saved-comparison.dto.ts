import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, Matches } from "class-validator";

const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateSavedComparisonDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Matches(SCHOOL_SLUG_PATTERN, { each: true })
  schoolSlugs!: string[];
}
