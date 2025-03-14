import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { NotificationEntity, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findAll(): Promise<NotificationEntity[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<NotificationEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  async findByStatus(status: NotificationStatus): Promise<NotificationEntity[]> {
    return this.repo.find({ where: { status } });
  }

  async findPendingScheduled(now: Date): Promise<NotificationEntity[]> {
    return this.repo.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
    });
  }

  async createNotification(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<void> {
    await this.repo.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
