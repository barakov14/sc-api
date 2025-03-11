import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../auth/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Берём пользователя из запроса (установлен в Guard)
  },
);
