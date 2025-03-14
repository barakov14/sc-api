import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationStatus } from './entities/notification.entity';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ required: false, description: 'ID пользователя, если подписка привязана к пользователю' })
  userId?: string;

  @ApiProperty({ description: 'Endpoint браузера для Web Push' })
  endpoint: string;

  @ApiProperty({ description: 'Ключи подписи PWA подписки' })
  keys: {
    p256dh: string;
    auth: string;
  };
}



export class CreateNotificationDto {
  @ApiProperty({ required: false, description: 'ID пользователя (если уведомление отправляется конкретному юзеру)' })
  userId?: string;

  @ApiProperty({ description: 'Заголовок уведомления' })
  title: string;

  @ApiProperty({ description: 'Описание (тело) уведомления' })
  description: string;
}

export class ScheduleNotificationDto {
  @ApiProperty({ required: false, description: 'ID пользователя (если уведомление отправляется конкретному юзеру)' })
  userId?: string;

  @ApiProperty({ description: 'Заголовок уведомления' })
  title: string;

  @ApiProperty({ description: 'Описание (тело) уведомления' })
  description: string;

  @ApiProperty({ description: 'Дата и время отправки уведомления (в формате ISO 8601)' })
  scheduledAt: Date;
}

@ApiTags('Уведомления')  // Группа в Swagger
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Подписка на push-уведомления' })
  @ApiResponse({ status: 201, description: 'Подписка успешно создана' })
  @Post('subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    const { userId, endpoint, keys } = subscribeDto;
    await this.notificationsService.subscribe(userId ?? null, endpoint, keys);
    return { success: true };
  }

  @ApiOperation({ summary: 'Отправить push-уведомление сразу' })
  @ApiResponse({ status: 201, description: 'Уведомление отправлено' })
  @Post('send')
  async sendNotification(@Body() dto: CreateNotificationDto) {
    const { userId, title, description } = dto;
    await this.notificationsService.sendNotification(userId ?? null, title, description);
    return { success: true };
  }

  @ApiOperation({ summary: 'Запланировать push-уведомление' })
  @ApiResponse({ status: 201, description: 'Уведомление запланировано' })
  @Post('schedule')
  async scheduleNotification(@Body() dto: ScheduleNotificationDto) {
    const { userId, title, description, scheduledAt } = dto;
    const scheduleDate = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt;
    await this.notificationsService.scheduleNotification(userId ?? null, title, description, scheduleDate);
    return { success: true };
  }

  @ApiOperation({ summary: 'Получить список уведомлений' })
  @ApiResponse({ status: 200, description: 'Список уведомлений получен' })
  @Get()
  async getNotifications(
    @Query('userId') userId?: string,
    @Query('status') status?: NotificationStatus,
  ) {
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    return this.notificationsService.getNotifications(filter);
  }

  @ApiOperation({ summary: 'Получить уведомление по ID' })
  @ApiResponse({ status: 200, description: 'Данные уведомления' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  @Get(':id')
  async getNotification(@Param('id') id: string) {
    return this.notificationsService.getNotification(id);
  }

  @ApiOperation({ summary: 'Удалить уведомление по ID' })
  @ApiResponse({ status: 200, description: 'Уведомление удалено' })
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(id);
    return { success: true };
  }
}
