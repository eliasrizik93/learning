import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log(`[Static Files] Serving uploads from: ${uploadsPath}`);
  console.log(`[Static Files] Directory exists: ${existsSync(uploadsPath)}`);
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Server] Running on http://localhost:${port}`);
  console.log(`[Server] Upload files accessible at http://localhost:${port}/uploads/`);
}
void bootstrap();
