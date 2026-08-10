import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateIf,
  Min,
} from 'class-validator';
import { LeadStage, LeadPriority } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valueAmount?: number;

  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  assignedToId?: string;
}
