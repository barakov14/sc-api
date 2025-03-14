import { Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('warehouse_user')
export class WarehouseUserEntity {
  @ApiProperty({ example: '456e7890-a12b-34c5-d678-901234567890', description: 'ID склада' })
  @PrimaryColumn()
  warehouse_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID пользователя' })
  @PrimaryColumn()
  user_id: string;
}
