import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class FilterInterpolatedMapsRequestDto {
  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate: Date;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  field: string;
}
