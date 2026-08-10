import { Module } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { PipelineController } from './pipeline.controller';
import { DealsService } from './services/deals.service';
import { PipelineService } from './services/pipeline.service';

@Module({
  controllers: [DealsController, PipelineController],
  providers: [DealsService, PipelineService],
  exports: [DealsService],
})
export class DealsModule {}
