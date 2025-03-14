import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { WarehouseUserEntity } from './entities/warehouse-user.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { UpdateWarehouseDto } from './dtos/update-warehouse.dto';
import { CreateWarehouseDto } from './dtos/create-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseUserEntity)
    private readonly warehouseUserRepository: Repository<WarehouseUserEntity>,
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>,
  ) {}


  async getAll(): Promise<WarehouseEntity[]> {
    return this.warehouseRepository.find();
  }

  async getById(id: string): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) throw new NotFoundException('Склад не найден');
    return warehouse;
  }

  async create(dto: CreateWarehouseDto): Promise<WarehouseEntity> {
    const newWarehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(newWarehouse);
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<WarehouseEntity> {
    await this.warehouseRepository.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Склад не найден');
  }

  async getUserAssignedWarehouses(user: UserEntity) {
    const warehouseUser = await this.warehouseUserRepository.find({
      where: {
        user_id: user.id,
      },
      select: ['warehouse_id'],
    });

    const warehouseIds = warehouseUser.map((wu) => wu.warehouse_id);

    if (warehouseIds.length === 0) {
      return [];
    }

    return (await this.getAll()).filter((warehouse) =>
      warehouseIds.includes(warehouse.id))
  }

  async assignWarehouseToUser(payload: {
    userId: string;
    warehouseId: string;
  }) {
    const warehouseAssigned = this.warehouseUserRepository.create({
      user_id: payload.userId,
      warehouse_id: payload.warehouseId,
    });

    return await this.warehouseUserRepository.save(warehouseAssigned);
  }
}