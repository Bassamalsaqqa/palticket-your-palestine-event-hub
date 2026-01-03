import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
    prisma = module.get(PrismaService);
  });

  const mockRequest = {
    headers: { 'idempotency-key': 'test-key' },
    user: { id: 'user-1' },
    orgId: 'org-1',
    method: 'POST',
    path: '/ops/orders',
    body: { test: 'data' },
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: () => of({ success: true }),
  };

  it('should allow request to proceed if no idempotency key', async () => {
    const noKeyRequest = { ...mockRequest, headers: {} };
    const context = {
      switchToHttp: () => ({
        getRequest: () => noKeyRequest,
      }),
    } as unknown as ExecutionContext;

    const spy = jest.spyOn(mockCallHandler, 'handle');
    await interceptor.intercept(context, mockCallHandler);
    expect(spy).toHaveBeenCalled();
  });

  it('should return stored response on replay with same hash', async () => {
    const storedResponse = { id: 'order-1' };
    
    // Mock hash to match
    jest.spyOn(require('crypto'), 'createHash').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mock-hash'),
    });
    
    prisma.idempotencyKey.findUnique.mockResolvedValue({
      responseCode: 201,
      responseBody: JSON.stringify(storedResponse),
      requestHash: 'mock-hash',
    } as any);

    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);
    const res = await firstValueFrom(result$);
    
    expect(res).toEqual(storedResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  it('should throw ConflictException on replay with different hash', async () => {
    prisma.idempotencyKey.findUnique.mockResolvedValue({
      requestHash: 'different-hash',
    } as any);

    // Mock actual hash
    jest.spyOn(require('crypto'), 'createHash').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mock-hash'),
    });

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      ConflictException,
    );
  });
});
