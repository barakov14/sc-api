import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthDto, DolibarrLoginResponse } from './dtos/auth.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DolibarrUserResponse } from './dtos/dolibarrUserResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /** 🔹 Валидация пользователя и выдача токенов */
  async validateUser(payload: AuthDto) {
    const dolibarrTokenData = await this.validateDolibarrAccount(payload);
    const dolibarrUserData = await this.findCurrentUserFromDolibarr(
      payload.username,
      dolibarrTokenData.success.token,
    );

    let user = await this.findUserInDB(dolibarrUserData.id);
    if (!user) {
      user = await this.createUserInDB(dolibarrUserData);
    }

    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      dolibarrKey: dolibarrTokenData.success.token,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      isExistPin: !!user.pin,
    };
  }

  /** 🔹 Получение токена от Dolibarr */
  private async validateDolibarrAccount(
    payload: AuthDto,
  ): Promise<DolibarrLoginResponse> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<DolibarrLoginResponse>(
          `${process.env.DOLIBARR_API}/login?login=${payload.username}&password=${payload.password}`,
        ),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException('Ошибка авторизации в Dolibarr');
    }
  }

  /** 🔹 Получение пользователя из Dolibarr по логину */
  private async findCurrentUserFromDolibarr(
    login: string,
    doliApiKey: string,
  ): Promise<DolibarrUserResponse> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<DolibarrUserResponse>(
          `${process.env.DOLIBARR_API}/users/login/${login}`,
          {
            headers: { DOLAPIKEY: doliApiKey },
          },
        ),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Пользователь не найден в Dolibarr',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /** 🔹 Создание пользователя в БД */
  private async createUserInDB(
    data: DolibarrUserResponse,
  ): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      dolibarrUserId: data.id,
      username: data.login,
    });

    return await this.userRepository.save(newUser);
  }

  /** 🔹 Поиск пользователя в БД по dolibarrUserId */
  private async findUserInDB(
    dolibarrUserId: string,
  ): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { dolibarrUserId } });
  }

  /** 🔹 Генерация JWT токенов (access и refresh) */
  private generateTokens(user: UserEntity) {
    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '365d',
      }),
    };
  }

  /** 🔹 Обновление refresh_token в БД */
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 8);
    await this.userRepository.update(userId, { refresh_token: hashedToken });
  }

  /** 🔹 Обновление токенов по refresh_token */
  async refreshTokens(oldRefreshToken: string) {
    const payload: { sub: string } = this.jwtService.verify(oldRefreshToken, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(oldRefreshToken, user.refresh_token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /** 🔹 Проверка PIN-кода пользователя */
  async checkPin(user: UserEntity, pin: string) {
    const foundUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'pin'], // 👈 Явно запрашиваем PIN
    });

    if (!foundUser) {
      throw new BadRequestException('❌ Пользователь не найден');
    }

    if (!foundUser.pin) {
      return await this.setPin(foundUser.id, pin);
    }

    const isMatch = await bcrypt.compare(pin, foundUser.pin);
    if (!isMatch) {
      throw new BadRequestException('❌ Неверный PIN-код');
    }

    return { message: '✅ PIN-код верный' };
  }

  /** 🔹 Установка PIN-кода и генерация токенов, если их нет */
  async setPin(userId: string, pin: string) {
    if (!/^\d{6}$/.test(pin)) {
      throw new BadRequestException('❌ PIN-код должен содержать ровно 6 цифр');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'pin'], // 👈 Явно запрашиваем PIN
    });

    if (!user) {
      throw new BadRequestException('❌ Пользователь не найден');
    }

    if (user.pin) {
      throw new BadRequestException('❌ PIN-код уже установлен');
    }

    const hashedPin = await bcrypt.hash(pin, 8);

    await this.userRepository.update(userId, {
      pin: hashedPin,
    });

    return {
      message: '✅ PIN-код успешно установлен',
    };
  }

  async getUserFromDolibarr(user: UserEntity, req: Request) {
    const headers = req.headers;
    const { data } = await firstValueFrom(
      this.http.get<DolibarrLoginResponse>(
        `${process.env.DOLIBARR_API}/users/${user.dolibarrUserId}`,
        {
          headers: {
            // @ts-ignore
            DOLAPIKEY: headers.dolapikey
          }
        },
      ),
    );

    console.log(data)

    return data;
  }
}
