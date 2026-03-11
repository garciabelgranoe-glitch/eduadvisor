import { IsIn, IsOptional, IsString } from "class-validator";
import { ListSchoolsDto } from "../../schools/dto/list-schools.dto";

export class SearchDto extends ListSchoolsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(["relevance", "name", "monthlyFeeEstimate", "createdAt", "leadIntentScore"])
  sortBy?: "relevance" | "name" | "monthlyFeeEstimate" | "createdAt" | "leadIntentScore" = "relevance";
}
