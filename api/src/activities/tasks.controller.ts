import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksQueryService } from './services/tasks.query.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('crm/tasks')
@UseGuards(SupabaseAuthGuard, TenantGuard, RolesGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly tasksQueryService: TasksQueryService,
  ) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getTasks(@Req() req: any, @Query() query: TaskQueryDto) {
    const data = await this.tasksQueryService.getTasks(req.tenantId, {
      ...query,
      userId: req.user.sub,
      role: req.user.role,
    });
    // TaskQueryService returns an object `{ stats, dashboardStats, tasks, pagination }` natively
    return { success: true, data };
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async createTask(@Req() req: any, @Body() body: CreateTaskDto) {
    const data = await this.tasksService.createTask(
      req.tenantId,
      req.user.sub,
      body,
    );
    return { success: true, data };
  }

  @Get('dashboard')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getDashboard(@Req() req: any) {
    const result = await this.tasksQueryService.getTasks(req.tenantId, {
      userId: req.user.sub,
      role: req.user.role,
      limit: 1000,
    });
    return {
      success: true,
      data: {
        stats: result.stats,
        dashboardStats: result.dashboardStats,
      },
    };
  }

  @Get('board')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getBoard(@Req() req: any, @Query('search') search: string = '') {
    const result = await this.tasksQueryService.getTasks(req.tenantId, {
      userId: req.user.sub,
      role: req.user.role,
      limit: 1000,
      search,
    });

    const columns = {
      PENDING: result.tasks.filter((t) => t.status === 'PENDING'),
      IN_PROGRESS: result.tasks.filter((t) => t.status === 'IN_PROGRESS'),
      BLOCKED: result.tasks.filter((t) => t.status === 'BLOCKED'),
      COMPLETED: result.tasks.filter((t) => t.status === 'COMPLETED'),
      CANCELLED: result.tasks.filter((t) => t.status === 'CANCELLED'),
      OVERDUE: result.tasks.filter((t) => t.status === 'OVERDUE'),
    };

    return { success: true, data: columns };
  }

  @Get('calendar')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getCalendar(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.tasksQueryService.getTasks(req.tenantId, {
      userId: req.user.sub,
      role: req.user.role,
      limit: 500,
      startDate,
      endDate,
    });

    const calendarEvents = result.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDateValue || task.createdAt,
      end: task.dueDateValue || task.createdAt,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      isOverdue: task.isOverdue,
      rawTask: task,
    }));

    return { success: true, data: calendarEvents };
  }

  @Get('export')
  @Roles('ADMIN', 'MANAGER', 'SALES')
  async exportTasks(@Req() req: any, @Query() query: any, @Res() res: any) {
    const csvString = await this.tasksQueryService.exportTasks(
      req.tenantId,
      req.user.sub,
      query,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks_export_${new Date().toISOString().split('T')[0]}.csv"`,
    );
    return res.status(200).send(csvString);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async getTaskById(@Req() req: any, @Param('id') id: string) {
    const data = await this.tasksQueryService.getTaskById(req.tenantId, id);
    if (!data) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return { success: true, data };
  }

  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'SALES', 'EMPLOYEE')
  async updateTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    const data = await this.tasksService.updateTask(
      req.tenantId,
      req.user.sub,
      id,
      body,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  async deleteTask(@Req() req: any, @Param('id') id: string) {
    const data = await this.tasksService.deleteTask(
      req.tenantId,
      req.user.sub,
      id,
    );
    return { success: true, data };
  }
}
