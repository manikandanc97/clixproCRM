import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  dealId?: string | null;

  @Transform(({ value }) => {
    const val = Number(value);
    if (isNaN(val) || !isFinite(val) || val < 0) return null; // Force validation failure if invalid
    return val;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsEnum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}
