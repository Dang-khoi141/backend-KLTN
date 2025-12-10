import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, raw } from 'express';

async function bootstrap() {
  // ==================================================
  // Create the NestJS application
  // ==================================================
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  const apiVersion = configService.get<string>('API_VERSION') || '1';
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });

  // =========  start: server config  ========= //
  const port = configService.get<number>('PORT') || 3012;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  const origin = configService.get<string>('ORIGIN') || '*';
  // =========  end: server config  ========= //

  // =========  start: swagger config  ========= //
  const swaggerConfig = new DocumentBuilder()
    .setTitle('KLTN API')
    .setDescription('API documentation for KLTN project')
    .setVersion(apiVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  console.log('📚 Swagger enabled at /api/docs');
  // =========  end: swagger config  ========= //


  // =========  start: Stripe webhook raw body ========= //
  // Stripe cần raw body để verify chữ ký:
  // URL thực tế của webhook = /api/v{apiVersion}/payment-mobile/webhook
  app.use(
    `/api/v${apiVersion}/payment-mobile/webhook`,
    raw({ type: 'application/json' }),
  );
  // Các route còn lại parse JSON bình thường
  app.use(json({ limit: '5mb' }));

  // Allowlist for CORS: keep wildcard behavior when origin is '*',
  // otherwise allow the configured origin plus fresh-food.dev (http and https).
  const corsOptions: CorsOptions = {
 
  origin: [    
    'https://fresh-food.dev',    
    'http://fresh-food.dev',
  ],
  methods: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  credentials: true, 
  allowedHeaders:
    'Content-Type, Cache-Control, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN, secret, recaptchavalue, sentry-trace, baggage',
};

app.enableCors(corsOptions);
  // =========  end: CORS config  ========= //

  // =========  start: other middleware config  ========= //
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // =========  end: other middleware config  ========= //

  // ==================================================
  // Start the application
  // ==================================================
  await app.listen(port, host);
  console.log(`🎉 Application is running on: http://${host}:${port}`);
  console.log(`📡 API endpoint: http://${host}:${port}/api/v${apiVersion}`);
}
bootstrap();
