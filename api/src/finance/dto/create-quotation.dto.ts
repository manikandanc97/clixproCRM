import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { QuotationStatus } from '@prisma/client';

export class CreateQuotationDto {
  @IsString()
  @IsOptional()
  quoteNumber?: string;

  @IsString()
  @IsNotEmpty()
  client: string;

  @IsString()
  @IsNotEmpty()
  leadId: string;

  @Transform(({ value }) => {
    const val = Number(value);
    if (isNaN(val) || !isFinite(val) || val < 0) return null;
    return val;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsEnum(QuotationStatus)
  @IsOptional()
  status?: QuotationStatus;

  @IsDateString()
  @IsOptional()
  validTill?: string | null;

  @IsArray()
  @IsOptional()
  items?: any[];

  @IsString()
  @IsOptional()
  notes?: string;

  @Transform(({ value }) => {
    const val = Number(value);
    if (isNaN(val) || !isFinite(val) || val < 0) return null;
    return val;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount?: number;

  @Transform(({ value }) => {
    const val = Number(value);
    if (isNaN(val) || !isFinite(val) || val < 0) return null;
    return val;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  tax?: number;
}
