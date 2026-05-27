import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS para el frontend
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Pampa Outdoor API')
    .setDescription('Backend para la tienda Pampa Outdoor')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}/docs`);
}
bootstrap();
