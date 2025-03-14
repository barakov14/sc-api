import { ApiProperty } from '@nestjs/swagger';
import { Column, PrimaryColumn } from 'typeorm';

export class WarehouseEntity {
  @ApiProperty({ example: '1', description: 'ID склада' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'Основной склад', description: 'Название склада' })
  @Column({nullable: false})
  lieu: string;

  @ApiProperty({ example: 'Склад для хранения оборудования', description: 'Описание' })
  @Column({nullable: true})
  description: string;

  @ApiProperty({ example: 'ул. Аль-Фараби, 32', description: 'Адрес' })
  @Column({nullable: true})
  address: string;

  @ApiProperty({ example: '050059', description: 'Почтовый индекс' })
  @Column({nullable: true})
  zip: string;

  @ApiProperty({ example: '+7 (727) 123-45-67', description: 'Телефон' })
  @Column({nullable: true})
  phone: string;

  @ApiProperty({ example: 'Алматы', description: 'Город' })
  @Column({nullable: true})
  town: string;

  @ApiProperty({ example: 'WH001', description: 'Ссылка на склад' })
  @Column({nullable: true})
  ref: string;
}
