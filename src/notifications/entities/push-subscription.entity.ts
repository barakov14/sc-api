import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('push_subscriptions')
export class PushSubscriptionEntity {
  @ApiProperty({ example: 'e7b1a64b-d5df-4a7f-b8f3-6d2a5cbb8e78', description: 'UUID подписки' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false, description: 'ID пользователя, если подписка привязана' })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/...', description: 'Endpoint браузера для Web Push' })
  @Column()
  endpoint: string;

  @ApiProperty({ example: 'BDFl3...H3g==', description: 'Ключ P256DH для подписи сообщений' })
  @Column()
  p256dh: string;

  @ApiProperty({ example: 'abcd1234==', description: 'Ключ авторизации подписки' })
  @Column()
  auth: string;

  @ApiProperty({ example: '2025-03-14T22:00:00.000Z', description: 'Дата создания подписки' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
