import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS enable karein taake Frontend (Port 3000) se API call allow ho sake
  app.enableCors();

  // Base64 image uploads ke liye body size limit 50MB karein
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();