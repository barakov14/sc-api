import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth/jwt-auth.guard';
import { WarehouseService } from './warehouse.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { AssignWarehouseDto } from './dtos/assign-warehouse.dto';
import { WarehouseEntity } from './entities/warehouse.entity';
import { UpdateWarehouseDto } from './dtos/update-warehouse.dto';
import { CreateWarehouseDto } from './dtos/create-warehouse.dto';

@ApiTags('Склады')  // Добавляем тег для Swagger
@ApiBearerAuth()  // JWT-токен обязателен для всех методов
@UseGuards(JwtAuthGuard)
@Controller('warehouse')
export class WarehouseController {

  constructor(private readonly warehouseService: WarehouseService) {}

  @ApiOperation({ summary: 'Получить склады, закреплённые за пользователем' })
  @ApiResponse({ status: 200, type: [WarehouseEntity], description: 'Список складов пользователя' })
  @Get('/user')
  getUserAssignedWarehouses(@CurrentUser() user: UserEntity, @Req() req: Request) {
    return this.warehouseService.getUserAssignedWarehouses(user);
  }

  @ApiOperation({ summary: 'Закрепить склад за пользователем' })
  @ApiResponse({ status: 201, description: 'Склад успешно закреплён за пользователем' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Post('/user')
  assignWarehouseToUser(@Body() payload: AssignWarehouseDto) {
    return this.warehouseService.assignWarehouseToUser(payload);
  }

  @ApiOperation({ summary: 'Получить все склады' })
  @ApiResponse({ status: 200, type: [WarehouseEntity], description: 'Список всех складов' })
  @Get('all')
  getWarehouses() {
    return this.warehouseService.getAll();
  }

  @ApiOperation({ summary: 'Создать новый склад' })
  @ApiResponse({ status: 201, type: WarehouseEntity, description: 'Склад успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить данные склада' })
  @ApiResponse({ status: 200, type: WarehouseEntity, description: 'Данные склада обновлены' })
  @ApiResponse({ status: 404, description: 'Склад не найден' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  @ApiOperation({ summary: 'Получить склад по ID' })
  @ApiResponse({ status: 200, type: WarehouseEntity, description: 'Данные о складе' })
  @ApiResponse({ status: 404, description: 'Склад не найден' })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.warehouseService.getById(id);
  }

  @ApiOperation({ summary: 'Удалить склад' })
  @ApiResponse({ status: 204, description: 'Склад успешно удалён' })
  @ApiResponse({ status: 404, description: 'Склад не найден' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.warehouseService.delete(id);
  }
}
