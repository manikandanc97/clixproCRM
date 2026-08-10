import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { DealStage } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  probability?: number;

  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
