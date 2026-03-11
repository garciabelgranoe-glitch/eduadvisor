import { IsBoolean } from "class-validator";

export class UpdateSchoolStatusDto {
  @IsBoolean()
  active!: boolean;
}
