import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";
import { buildApiSecurityHeaders, buildCorsAllowlist, isCorsOriginAllowed } from "./common/http-security/http-security.config";

const LOCAL_NODE_ENVS = new Set(["development", "test"]);

function assertCriticalApiEnv() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (LOCAL_NODE_ENVS.has(nodeEnv)) {
    return;
  }

  const required = ["DATABASE_URL", "ADMIN_API_KEY", "REDIS_URL"];
  const missing = required.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Missing critical API env vars: ${missing.join(", ")}`);
  }
}

async function bootstrap() {
  assertCriticalApiEnv();

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable("x-powered-by");

  const corsAllowlist = buildCorsAllowlist();

  app.enableCors({
    origin(origin, callback) {
      callback(null, isCorsOriginAllowed(origin, corsAllowlist));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With", "X-Admin-Api-Key"],
    optionsSuccessStatus: 204,
    maxAge: 600
  });

  const securityHeaders = buildApiSecurityHeaders();
  app.use((_: Request, response: Response, next: NextFunction) => {
    Object.entries(securityHeaders).forEach(([headerName, value]) => {
      response.setHeader(headerName, value);
    });
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  app.setGlobalPrefix("v1");

  const swaggerConfig = new DocumentBuilder()
    .setTitle("EduAdvisor API")
    .setDescription("API para búsqueda, comparación y evaluación de colegios")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  const server = app.getHttpServer() as {
    keepAliveTimeout?: number;
    headersTimeout?: number;
  };
  if (server) {
    server.keepAliveTimeout = 61_000;
    server.headersTimeout = 65_000;
  }
}

bootstrap();
