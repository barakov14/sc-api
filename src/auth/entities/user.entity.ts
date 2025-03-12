import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('identity')
  id: string;

  @Column({ unique: true })
  dolibarrUserId: string;

  @Column({ nullable: true, select: false })
  pin: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ unique: true })
  username: string;
}
