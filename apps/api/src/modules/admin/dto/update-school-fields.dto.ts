import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateSchoolFieldsDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
