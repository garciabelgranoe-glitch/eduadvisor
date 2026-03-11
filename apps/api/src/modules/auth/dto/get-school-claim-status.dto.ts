import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class GetSchoolClaimStatusDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  schoolSlug!: string;
}
