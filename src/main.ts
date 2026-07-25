import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { EnvConfigService } from './env-config/env-config.service';
import { SwaggerConfiguration } from './lib/swagger/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const envConfigService = app.get(EnvConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    credentials: true,
    origin: envConfigService.getClientUrl(),
  });
  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  SwaggerConfiguration(app, envConfigService);

  await app.listen(envConfigService.getPort() ?? 5000);
}
bootstrap();
