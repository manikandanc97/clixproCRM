import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { MeetingsController } from './meetings.controller';
import { CalendarController } from './calendar.controller';
import { TasksService } from './services/tasks.service';
import { TasksQueryService } from './services/tasks.query.service';
import { MeetingsService } from './services/meetings.service';
import { CalendarService } from './services/calendar.service';

@Module({
  controllers: [TasksController, MeetingsController, CalendarController],
  providers: [
    TasksService,
    TasksQueryService,
    MeetingsService,
    CalendarService,
  ],
  exports: [TasksService, TasksQueryService, MeetingsService, CalendarService],
})
export class ActivitiesModule {}
