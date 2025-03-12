import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class PinDto {
  @ApiProperty({ example: '123456', description: '6-значный PIN-код' })
  @IsString()
  @Length(6, 6, { message: 'PIN-код должен содержать ровно 6 цифр' })
  @Matches(/^\d+$/, { message: 'PIN-код должен содержать только цифры' })
  pin: string;
}
