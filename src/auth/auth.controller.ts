import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PinDto } from './dtos/pin.dto';

@ApiTags('Authentication') // 📌 Добавляем Swagger-тег для группировки эндпоинтов
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'Успешная авторизация' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  login(@Body() payload: AuthDto) {
    return this.authService.validateUser(payload);
  }

  @Put('refresh-token')
  @ApiOperation({ summary: 'Обновление access/refresh токена' })
  @ApiBody({
    schema: {
      example: { refreshToken: 'your-refresh-token' },
    },
  })
  @ApiResponse({ status: 200, description: 'Новый access и refresh токен' })
  @ApiResponse({ status: 401, description: 'Недействительный refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получение текущего пользователя' })
  @ApiBearerAuth() // 📌 Защищенный эндпоинт (JWT)
  @ApiResponse({
    status: 200,
    description: 'Текущий пользователь',
    type: UserEntity,
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getCurrentUser(@CurrentUser() user: UserEntity, @Req() req: Request) {
    console.log(user)
    const data = await this.authService.getUserFromDolibarr(user, req);
    return {
      ...data,
      ...user,
    };
  }

  @Post('pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверка 6-значного PIN-кода' })
  @ApiResponse({ status: 200, description: 'PIN-код верный' })
  @ApiResponse({ status: 400, description: 'PIN-код неверный' })
  checkPinCode(@Body() pinDto: PinDto, @CurrentUser() user: UserEntity) {
    return this.authService.checkPin(user, pinDto.pin);
  }
}
