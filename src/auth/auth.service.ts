import {
  Inject,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException
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
    const dolibarrUserData = await this.findCurrentUserFromDolibarr(payload.username, dolibarrTokenData.success.token);

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
      isExitPin: !!user.pin
    };
  }

  /** 🔹 Отправка запроса в Dolibarr для получения токена */
  private async validateDolibarrAccount(payload: AuthDto): Promise<DolibarrLoginResponse> {
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

  /** 🔹 Запрос данных пользователя из Dolibarr по логину */
  private async findCurrentUserFromDolibarr(login: string, doliApiKey: string): Promise<DolibarrUserResponse> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<DolibarrUserResponse>(`${process.env.DOLIBARR_API}/users/login/${login}`, {
          headers: {
            DOLAPIKEY: doliApiKey
          }
        }),
      );
      return data;
    } catch (error) {
      throw new HttpException('Пользователь не найден в Dolibarr', HttpStatus.NOT_FOUND);
    }
  }

  /** 🔹 Создание нового пользователя в БД */
  private async createUserInDB(data: DolibarrUserResponse): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      dolibarrUserId: data.id,
      module: data.module,
      entity: data.entity,
      import_key: data.import_key,
      array_options: data.array_options,
      array_languages: data.array_languages,
      contacts_ids: data.contacts_ids,
      linkedObjectsIds: data.linkedObjectsIds,
      canvas: data.canvas,
      fk_project: data.fk_project,
      contact_id: data.contact_id,
      user: data.user,
      origin_type: data.origin_type,
      origin_id: data.origin_id,
      ref: data.ref,
      ref_ext: data.ref_ext,
      statut: data.statut,
      status: data.status,
      country_id: data.country_id,
      country_code: data.country_code,
      state_id: data.state_id,
      region_id: data.region_id,
      barcode_type: data.barcode_type,
      barcode_type_coder: data.barcode_type_coder,
      mode_reglement_id: data.mode_reglement_id,
      cond_reglement_id: data.cond_reglement_id,
      demand_reason_id: data.demand_reason_id,
      transport_mode_id: data.transport_mode_id,
      shipping_method: data.shipping_method,
      fk_multicurrency: data.fk_multicurrency,
      multicurrency_code: data.multicurrency_code,
      multicurrency_tx: data.multicurrency_tx,
      multicurrency_total_ht: data.multicurrency_total_ht,
      multicurrency_total_tva: data.multicurrency_total_tva,
      multicurrency_total_ttc: data.multicurrency_total_ttc,
      last_main_doc: data.last_main_doc,
      fk_account: data.fk_account,
      note_public: data.note_public,
      note_private: data.note_private,
      actiontypecode: data.actiontypecode,
      name: data.name,
      lastname: data.lastname,
      firstname: data.firstname,
      civility_id: data.civility_id,
      user_author: data.user_author,
      user_creation: data.user_creation,
      user_valid: data.user_valid,
      user_validation: data.user_validation,
      user_closing_id: data.user_closing_id,
      user_modification: data.user_modification,
      specimen: data.specimen,
      extraparams: data.extraparams,
      employee: data.employee,
      login: data.login,
      pass_crypted: data.pass_crypted,
      datec: data.datec,
      datem: data.datem,
      socid: data.socid,
      fk_member: data.fk_member,
      fk_user: data.fk_user,
      clicktodial_url: data.clicktodial_url,
      clicktodial_login: data.clicktodial_login,
      iplastlogin: data.iplastlogin,
      ippreviouslogin: data.ippreviouslogin,
      photo: data.photo,
      lang: data.lang,
      rights: data.rights,
      user_group_list: data.user_group_list,
      conf: data.conf,
      salary: data.salary,
      salaryextra: data.salaryextra,
      weeklyhours: data.weeklyhours,
      color: data.color,
      address: data.address,
      zip: data.zip,
      town: data.town,
      date_creation: this.parseDate(data.date_creation),
      date_validation: this.parseDate(data.date_validation),
      date_modification: this.parseDate(data.date_modification),
      date_cloture: this.parseDate(data.date_cloture),
      dateemployment: this.parseDate(data.dateemployment),
      dateemploymentend: this.parseDate(data.dateemploymentend),
      datelastlogin: this.parseDate(data.datelastlogin),
      datepreviouslogin: this.parseDate(data.datepreviouslogin),
    });

    return await this.userRepository.save(newUser);
  }

  /** 🔹 Поиск пользователя по ID из Dolibarr */
  private async findUserInDB(dolibarrUserId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { dolibarrUserId } });
  }

  /** 🔹 Генерация JWT токенов (access и refresh) */
  private generateTokens(user: UserEntity) {
    const payload = { sub: user.id, username: user.login };

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

  /** 🔹 Обновление refresh_token пользователя в БД */
  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refresh_token: hashedToken });
  }

  /** 🔹 Обновление access_token по refresh_token */
  async refreshTokens(userId: string, oldRefreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

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
      refresh_token: tokens.refresh_token
    };
  }

  private parseDate(value: any): Date | null {
    if (!value || value === '') return null; // Если значение пустое или null, возвращаем null

    // Если значение - число (Unix timestamp), конвертируем в дату
    if (!isNaN(value) && typeof value === 'number') {
      return new Date(value * 1000); // Умножаем на 1000, т.к. в API приходят секунды
    }

    // Пробуем создать объект Date из строки
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  async checkPin(user: UserEntity, pin: string) {
    if (!user) {
      throw new BadRequestException('❌ Пользователь не найден');
    }

    if (!user.pin) {
      // Если PIN отсутствует, хешируем и устанавливаем его
      await this.setPin(user.id, pin);
      return { message: '✅ PIN-код установлен и подтверждён' };
    }

    // ✅ Сравниваем введённый PIN с хешированным значением в БД
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (isMatch) {
      return { message: '✅ PIN-код верный' };
    } else {
      throw new BadRequestException('❌ Неверный PIN-код');
    }
  }



  async setPin(userId: string, pin: string) {
    if (!/^\d{6}$/.test(pin)) {
      throw new BadRequestException('❌ PIN-код должен содержать ровно 6 цифр');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('❌ Пользователь не найден');
    }

    if (user.pin) {
      throw new BadRequestException('❌ PIN-код уже установлен');
    }

    const hashedPin = await bcrypt.hash(pin, 10); // ✅ Хешируем PIN перед сохранением
    user.pin = hashedPin;

    await this.userRepository.save(user);

    return { message: '✅ PIN-код успешно установлен' };
  }


}
