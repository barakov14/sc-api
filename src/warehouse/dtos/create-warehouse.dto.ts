import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Основной склад', description: 'Название склада' })
  lieu: string;

  @ApiProperty({ example: 'Склад для хранения оборудования', description: 'Описание' })
  description: string;

  @ApiProperty({ example: 'ул. Аль-Фараби, 32', description: 'Адрес' })
  address: string;

  @ApiProperty({ example: '050059', description: 'Почтовый индекс' })
  zip: string;

  @ApiProperty({ example: '+7 (727) 123-45-67', description: 'Телефон' })
  phone: string;

  @ApiProperty({ example: 'Алматы', description: 'Город' })
  town: string;

  @ApiProperty({ example: 'WH001', description: 'Ссылка на склад' })
  ref: string;
}
