import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TargetPeriod } from '@prisma/client';

export class CreateRevenueTargetDto {
  @IsEnum(TargetPeriod)
  @IsOptional()
  periodType?: TargetPeriod;

  @Transform(({ value }) => {
    const val = Number(value);
    if (isNaN(val) || !isFinite(val) || val < 0) return null; // Force validation failure if invalid
    return val;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
