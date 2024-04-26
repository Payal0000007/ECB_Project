import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadGatewayException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true,exceptionFactory(errors) {
    return new BadGatewayException({
      message:'Validation Failed',
      errors:errors
    })
  }, }));
  
  app.enableCors({
    origin:"*",
    methods:['GET','PUT','POST','DELETE','PATCH']
  })
  await app.listen(8000);
}
bootstrap();
