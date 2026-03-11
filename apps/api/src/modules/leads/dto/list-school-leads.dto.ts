import { LeadStatus } from "@prisma/client";
import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class ListSchoolLeadsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsIn(["createdAt", "childAge"])
  sortBy?: "createdAt" | "childAge" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
