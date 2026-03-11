import { Type } from "class-transformer";
import { ReviewStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class ListModerationQueueDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus = ReviewStatus.PENDING;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
