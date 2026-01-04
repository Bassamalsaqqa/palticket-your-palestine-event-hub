import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';
import { AuthenticatedRequest } from '../types';

import { Response } from 'express';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const orgId = request.orgId;

    const body = request.body as unknown;
    const path = request.path;
    const method = request.method;
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return next.handle();
    }

    if (!user || !orgId) {
      return next.handle();
    }

    const requestHash = createHash('sha256')
      .update(JSON.stringify(body))
      .digest('hex');

    // Check for existing key
    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: {
        organizationId_userId_requestMethod_requestPath_key: {
          organizationId: orgId,
          userId: user.id,
          requestMethod: method,
          requestPath: path,
          key: idempotencyKey,
        },
      },
    });

    if (existingKey) {
      if (existingKey.requestHash !== requestHash) {
        throw new ConflictException(
          'Idempotency key reused with different request body',
        );
      }
      const response = context.switchToHttp().getResponse<Response>();
      response.status(existingKey.responseCode);
      return of(JSON.parse(existingKey.responseBody));
    }

    // Proceed and save response
    return next.handle().pipe(
      tap((response: unknown) => {
        const httpResponse = context.switchToHttp().getResponse<Response>();
        const statusCode = httpResponse.statusCode;

        this.saveIdempotencyKey(
          idempotencyKey,
          orgId,
          user.id,
          method,
          path,
          body,
          requestHash,
          statusCode,
          response,
        ).catch(() => {
          /* Ignore errors */
        });
      }),
    );
  }

  private async saveIdempotencyKey(
    key: string,
    organizationId: string,
    userId: string,
    requestMethod: string,
    requestPath: string,
    requestParams: unknown,
    requestHash: string,
    responseCode: number,
    response: unknown,
  ) {
    try {
      await this.prisma.idempotencyKey.create({
        data: {
          key,
          organizationId,
          userId,
          requestMethod,
          requestPath,
          requestHash,
          responseCode,
          responseBody: JSON.stringify(response),
        },
      });
    } catch {
      // Duplicate key or other error
    }
  }
}
