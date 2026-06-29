import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { GlobalExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  /**
   * Nếu chạy sau Nginx/Caddy/Cloudflare.
   * Cần để lấy đúng client IP cho logs/rate-limit.
   */
  app.set('trust proxy', 1);

  /**
   * Ẩn Express header.
   */
  app.disable('x-powered-by');

  /**
   * Security headers.
   * Helmet nên đặt sớm trước routes/middleware khác.
   */
  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
    }),
  );

  /**
   * Request ID để trace log/debug.
   */
  app.use((req, res, next) => {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  });

  /**
   * API versioning.
   * Final route sẽ thành /v1/...
   */

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  /**
   * Validation.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) => {
          if (!error.constraints) return [];

          return Object.values(error.constraints).map((message) => {
            return `${error.property} ${message}`;
          });
        });

        return new BadRequestException(messages);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  /**
   * CORS.
   */
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://heispace.com',
    'https://console.heispace.com',
  ];

  app.enableCors({
    origin(origin, callback) {
      // allow Postman/curl/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (!isProd || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'x-request-id',
      'idempotency-key',
    ],
    exposedHeaders: ['x-request-id'],
  });

  /**
   * API Docs.
   * Dev thì mở tự do.
   * Production thì nên tắt hoặc bảo vệ bằng auth/basic auth.
   */
  const docsEnabled =
    !isProd || process.env.API_DOCS_ENABLED === 'true';

  if (docsEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Heispace API')
      .setDescription('Heispace backend API documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
        },
        'x-api-key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use(
      '/reference',
      apiReference({
        content: document,
        theme: 'purple',
      }),
    );
  }

  /**
   * Graceful shutdown.
   */
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();