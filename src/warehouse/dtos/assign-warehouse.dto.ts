import { ApiProperty } from '@nestjs/swagger';

export class AssignWarehouseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ example: '456e7890-a12b-34c5-d678-901234567890', description: 'ID склада' })
  warehouseId: string;
}
