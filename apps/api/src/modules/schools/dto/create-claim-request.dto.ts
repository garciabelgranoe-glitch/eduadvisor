import { ClaimRequestType } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

export class CreateClaimRequestDto {
  @IsOptional()
  @IsEnum(ClaimRequestType)
  requestType?: ClaimRequestType = ClaimRequestType.CLAIM;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  schoolSlug?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(180)
  schoolName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  province!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsUrl({ require_tld: false })
  website?: string | null;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactRole!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string | null;
}
