import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Allowlist for CORS: keep wildcard behavior when origin is '*',
  // otherwise allow the configured origin plus fresh-food.dev (http and https).
  const extraAllowedOrigins = ['https://fresh-food.dev', 'http://fresh-food.dev'];
  const originList = origin === '*'
    ? '*'
    : Array.from(new Set([...(Array.isArray(origin) ? origin : [origin]), ...extraAllowedOrigins]));

  const corsOptions: CorsOptions = {
    origin: originList,
    methods: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: origin !== '*',
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
