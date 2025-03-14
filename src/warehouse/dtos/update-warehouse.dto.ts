import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  @ApiProperty({ example: '1', description: 'ID склада' })
  id: string;
}
