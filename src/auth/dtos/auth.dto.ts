import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export type DolibarrLoginResponse = {
  success: {
    token: string;
  };
};
