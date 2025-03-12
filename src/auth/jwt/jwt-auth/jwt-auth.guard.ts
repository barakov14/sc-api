import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DolibarrService } from '../../../common/services/dolibarr.service';
import { UserEntity } from '../../entities/user.entity';
import { DolibarrUserResponse } from '../../dtos/dolibarrUserResponse.dto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // @ts-ignore
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Токен отсутствует');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new UnauthorizedException('Некорректный формат токена');
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // @ts-ignore
      request.user = user; // Устанавливаем пользователя в запрос
      return true;
    } catch (error) {
      throw new ForbiddenException('Невалидный или просроченный токен');
    }
  }
}
