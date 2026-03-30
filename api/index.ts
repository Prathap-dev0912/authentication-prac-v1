import { NestFactory } from '@nestjs/core';

import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from 'src/app.module';

let server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler = async (event, context) => {
  if (!server) {
    server = await bootstrap();
  }
  return server(event, context);
};