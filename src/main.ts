import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ***** CORS *****
  const origins = `${process.env.APP_URL_ORIGIN}:${process.env.APP_PORT_ORIGIN}`; // 'http://127.0.0.1:8080';
  console.log(origins);
  const corsConfig = {
    origin: origins,
    allowedHeaders:
      'Access-Control-Allow-Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
    methods: 'GET,PUT,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  };
  app.enableCors(corsConfig);
  console.log('## ORIGIN: ', origins);
  // ***** CORS *****

  app.setGlobalPrefix('api');
  await app.listen(process.env.API_PORT || 3000);
  console.log('control: ', process.env.CONTROL);
}
bootstrap();
