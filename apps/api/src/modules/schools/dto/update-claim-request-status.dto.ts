import { ClaimStatus, VerificationMethod } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class UpdateClaimRequestStatusDto {
  @IsEnum(ClaimStatus)
  status!: ClaimStatus;

  @ValidateIf((input: UpdateClaimRequestStatusDto) => input.status === ClaimStatus.APPROVED)
  @IsEnum(VerificationMethod)
  verificationMethod?: VerificationMethod;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
