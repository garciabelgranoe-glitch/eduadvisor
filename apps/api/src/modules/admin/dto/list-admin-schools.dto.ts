import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListAdminSchoolsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(["active", "inactive", "all"])
  status?: "active" | "inactive" | "all" = "all";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @IsOptional()
  @IsIn(["name", "createdAt"])
  sortBy?: "name" | "createdAt" = "name";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}
