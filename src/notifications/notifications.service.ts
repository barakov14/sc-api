import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import * as webPush from 'web-push';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationStatus } from './entities/notification.entity';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationRepository: NotificationsRepository,
    @InjectRepository(PushSubscriptionEntity)
    private readonly subscriptionRepo: Repository<PushSubscriptionEntity>,
  ) {
    // Настройка web-push с VAPID-ключами из переменных окружения
    webPush.setVapidDetails(
      process.env.WEB_PUSH_VAPID_SUBJECT || 'mailto:admin@yourdomain.com',
      process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
      process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
    );
  }

  /** Подписка пользователя (или анонимного посетителя) на push-уведомления. Сохраняет subscription-объект в БД. */
  async subscribe(userId: string | null, endpoint: string, keys: { p256dh: string; auth: string }): Promise<void> {
    const subscription = this.subscriptionRepo.create({ userId, endpoint, p256dh: keys.p256dh, auth: keys.auth });
    try {
      await this.subscriptionRepo.save(subscription);
      this.logger.log(`Subscribed to notifications: user=${userId}, endpoint=${endpoint}`);
    } catch (error) {
      this.logger.error('Failed to save subscription', error);
      throw error;
    }
  }

  /** Немедленная отправка push-уведомления одному пользователю (если указан userId) или всем подписчикам. */
  async sendNotification(userId: string | null, title: string, description: string): Promise<void> {
    // Создаем запись уведомления со статусом PENDING
    const notification = await this.notificationRepository.createNotification({
      userId,
      title,
      description,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      scheduledAt: null,
    });

    const payload = JSON.stringify({ title, description });
    let allSuccess = true;
    // Получаем все подписки для указанного пользователя или для всех, если userId не задан
    const subscriptions = userId
      ? await this.subscriptionRepo.find({ where: { userId } })
      : await this.subscriptionRepo.find();
    if (subscriptions.length === 0) {
      this.logger.warn(`No subscriptions found for user ${userId ?? 'ALL'}`);
      allSuccess = false;
    }

    // Отправляем уведомление на каждую найденную подписку
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (error) {
        allSuccess = false;
        this.logger.error(`Push notification failed for endpoint ${sub.endpoint}`, error);
        // TODO: при ошибке 410 (Gone) можно удалить subscription из БД как неактуальную
      }
    }

    // Обновляем статус уведомления в БД (SENT, если успешно всем, иначе FAILED)
    const newStatus = allSuccess ? NotificationStatus.SENT : NotificationStatus.FAILED;
    await this.notificationRepository.updateStatus(notification.id, newStatus);
    this.logger.log(`Notification ${notification.id} sent status: ${newStatus}`);
  }

  /** Планирование отправки уведомления на будущее время. */
  async scheduleNotification(userId: string | null, title: string, description: string, scheduledAt: Date): Promise<void> {
    // Создаем уведомление со статусом PENDING и указанным временем отправки
    await this.notificationRepository.createNotification({
      userId,
      title,
      description,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      scheduledAt: scheduledAt,
    });
    this.logger.log(`Scheduled notification for user ${userId ?? 'ALL'} at ${scheduledAt.toISOString()}`);
  }

  /** Cron-задача, проверяющая запланированные уведомления и отправляющая их, когда наступает время. */
  @Cron('*/60 * * * * *')  // Запуск каждую минуту (каждые 60 секунд)
  async checkScheduledNotifications(): Promise<void> {
    const now = new Date();
    const dueNotifications = await this.notificationRepository.findPendingScheduled(now);
    for (const notification of dueNotifications) {
      const { id, userId, title, description } = notification;
      this.logger.log(`Executing scheduled notification ${id} (user=${userId ?? 'ALL'})`);
      let allSuccess = true;
      const payload = JSON.stringify({ title, description });
      const subscriptions = userId
        ? await this.subscriptionRepo.find({ where: { userId } })
        : await this.subscriptionRepo.find();
      if (subscriptions.length === 0) {
        this.logger.warn(`No subscriptions for scheduled notification ${id}`);
        allSuccess = false;
      }
      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
        } catch (error) {
          allSuccess = false;
          this.logger.error(`Scheduled push failed for ${sub.endpoint}`, error);
        }
      }
      const newStatus = allSuccess ? NotificationStatus.SENT : NotificationStatus.FAILED;
      await this.notificationRepository.updateStatus(id, newStatus);
      this.logger.log(`Scheduled notification ${id} sent status: ${newStatus}`);
    }
  }

  /** Получить список уведомлений с опциональной фильтрацией по пользователю или статусу. */
  async getNotifications(filter?: { userId?: string; status?: NotificationStatus }): Promise<NotificationEntity[]> {
    if (!filter) {
      return this.notificationRepository.findAll();
    }
    if (filter.userId && filter.status) {
      return this.notificationRepository['repo'].find({ where: { userId: filter.userId, status: filter.status } });
    } else if (filter.userId) {
      return this.notificationRepository.findByUser(filter.userId);
    } else if (filter.status) {
      return this.notificationRepository.findByStatus(filter.status);
    }
    return this.notificationRepository.findAll();
  }

  /** Получить одно уведомление по ID. */
  async getNotification(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  /** Удалить уведомление по ID. */
  async deleteNotification(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
