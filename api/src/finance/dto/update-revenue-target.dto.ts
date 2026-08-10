import { PartialType } from '@nestjs/mapped-types';
import { CreateRevenueTargetDto } from './create-revenue-target.dto';

export class UpdateRevenueTargetDto extends PartialType(
  CreateRevenueTargetDto,
) {}
