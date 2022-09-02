import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

  //Por defecto cuando llega el limit, este llega como string por lo cual con el decoradro type cambiamos su tipo a number
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;


  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
