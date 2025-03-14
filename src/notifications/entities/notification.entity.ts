import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('notifications')
export class NotificationEntity {
  @ApiProperty({ example: 'e7b1a64b-d5df-4a7f-b8f3-6d2a5cbb8e78', description: 'UUID уведомления' })
  @PrimaryGeneratedColumn()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false, description: 'ID пользователя' })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({ example: 'Новая заявка', description: 'Заголовок уведомления' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Ваша заявка на отпуск одобрена', description: 'Текст уведомления' })
  @Column()
  description: string;

  @ApiProperty({ enum: NotificationStatus, description: 'Статус уведомления' })
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @ApiProperty({ example: '2025-12-26T16:00:00.000Z', description: 'Дата создания' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-26T16:00:00.000Z', required: false, description: 'Дата запланированной отправки' })
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;
}
