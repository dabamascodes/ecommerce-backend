import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const logger = new Logger('Bootstrap'); 

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');
  const host = configService.getOrThrow<string>('app.hostApi');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            
      forbidNonWhitelisted: true,
      transform: true,            
    }),
  );

  await app.listen(port);
  
  logger.log(`🚀 Application running on: ${host}/api`);
}
bootstrap();