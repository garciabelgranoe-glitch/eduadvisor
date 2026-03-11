import { Type } from "class-transformer";
import { ClaimRequestType, ClaimStatus } from "@prisma/client";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListClaimRequestsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsEnum(ClaimRequestType)
  requestType?: ClaimRequestType;

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
  @IsIn(["createdAt", "updatedAt"])
  sortBy?: "createdAt" | "updatedAt" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
