import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAuthSessionDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  schoolSlug?: string;
}
