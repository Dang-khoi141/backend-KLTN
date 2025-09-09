import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  console.log('🚀 Starting NestJS application...');

  const app = await NestFactory.create(AppModule);
  console.log('✅ NestJS application created successfully');

  const configService = app.get(ConfigService);
  console.log('✅ ConfigService initialized');

  app.setGlobalPrefix('api');
  const apiVersion = configService.get<string>('API_VERSION') || '1';
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });
  console.log(`📋 API versioning enabled with version: ${apiVersion}`);

  const port = configService.get<number>('PORT') || 3001;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  const origin = configService.get<string>('ORIGIN') || '*';

  console.log(`🔧 Configuration loaded:`);
  console.log(`   - Port: ${port}`);
  console.log(`   - Host: ${host}`);
  console.log(`   - Origin: ${origin}`);

  const corsOptions: CorsOptions = {
    origin: origin === '*' ? '*' : [origin],
    methods: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: origin !== '*',
    allowedHeaders:
      'Content-Type, Cache-Control, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN, secret, recaptchavalue, sentry-trace, baggage',
  };

  app.enableCors(corsOptions);

  console.log(
    '🌐 CORS enabled with options:',
    JSON.stringify(corsOptions, null, 2),
  );

  await app.listen(port, host);
  console.log(`🎉 Application is running on: http://${host}:${port}`);
  console.log(`📡 API endpoint: http://${host}:${port}/api/v${apiVersion}`);
}
bootstrap();
