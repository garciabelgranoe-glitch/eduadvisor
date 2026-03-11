import { Type } from "class-transformer";
import { ImportRunStatus, ImportSource } from "@prisma/client";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListImportRunsDto {
  @IsOptional()
  @IsEnum(ImportSource)
  source?: ImportSource;

  @IsOptional()
  @IsEnum(ImportRunStatus)
  status?: ImportRunStatus;

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
  limit?: number = 20;

  @IsOptional()
  @IsIn(["createdAt", "updatedAt"])
  sortBy?: "createdAt" | "updatedAt" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
