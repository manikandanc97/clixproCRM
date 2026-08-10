import { IsArray, IsString } from 'class-validator';

export class BulkDealDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
