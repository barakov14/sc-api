import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseUserEntity } from './entities/warehouse-user.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WarehouseUserEntity]),
    HttpModule,
    AuthModule
  ],
  providers: [WarehouseService],
  controllers: [WarehouseController]
})
export class WarehouseModule {}
