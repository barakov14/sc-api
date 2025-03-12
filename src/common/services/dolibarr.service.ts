import {
  Injectable,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as process from 'node:process';

@Injectable()
export class DolibarrService {
  constructor(private readonly http: HttpService) {}

  /** 🔹 Универсальный GET-запрос */
  async get<T>(url: string, context: ExecutionContext): Promise<T> {
    return this.request<T>('get', url, null, context);
  }

  /** 🔹 Универсальный POST-запрос */
  async post<T>(
    url: string,
    data: unknown,
    context: ExecutionContext,
  ): Promise<T> {
    return this.request<T>('post', url, data, context);
  }

  /** 🔹 Универсальный PUT-запрос */
  async put<T>(
    url: string,
    data: unknown,
    context: ExecutionContext,
  ): Promise<T> {
    return this.request<T>('put', url, data, context);
  }

  /** 🔹 Универсальный PATCH-запрос */
  async patch<T>(
    url: string,
    data: unknown,
    context: ExecutionContext,
  ): Promise<T> {
    return this.request<T>('patch', url, data, context);
  }

  /** 🔹 Универсальный DELETE-запрос */
  async delete<T>(url: string, context: ExecutionContext): Promise<T> {
    return this.request<T>('delete', url, null, context);
  }

  /** 🔹 Базовый метод для запросов */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    context?: ExecutionContext, // Добавили контекст для доступа к заголовкам
  ): Promise<T> {
    try {
      // 🔥 Извлекаем заголовки клиента
      const request = context?.switchToHttp().getRequest();
      const clientHeaders = request?.headers || {};

      // 🔥 Извлекаем DOLAPIKEY от клиента
      const dolapiKey =
        clientHeaders['dolapikey'] ||
        clientHeaders['DOLAPIKEY'] ||
        clientHeaders['Dolapikey'];
      if (!dolapiKey) {
        throw new HttpException(
          '❌ Отсутствует DOLAPIKEY в заголовках',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 🔥 Формируем заголовки
      const headers = {
        ...clientHeaders,
        'Content-Type': 'application/json', // Дефолтный заголовок
        DOLAPIKEY: dolapiKey, // Добавляем DOLAPIKEY
      };

      const response: AxiosResponse<T> = await firstValueFrom(
        this.http
          .request<T>({
            method,
            url: `${process.env.DOLIBARR_API}${url}`,
            data,
            headers,
          })
          .pipe(
            catchError((error) => {
              throw new HttpException(
                `❌ Ошибка HTTP-запроса: ${error.response?.status} ${error.response?.statusText}`,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.message || '❌ Ошибка при отправке запроса',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
