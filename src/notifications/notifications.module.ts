import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { NotificationEntity } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, PushSubscriptionEntity]),
  ],
  providers: [NotificationsService, NotificationsRepository],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
