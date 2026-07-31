import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { taskRoutes } from './routes/tasks.js';

export function buildApp() {
  const app = fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: '*',
  });

  // Custom Error Handler for Fail-Fast Validation (422 Unprocessable Entity)
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError || error.statusCode === 400 || error.name === 'ZodError' || (error as any).validation) {
      return reply.status(422).send({
        error: 'Unprocessable Entity',
        statusCode: 422,
        message: 'Invalid input payload validation failed',
        details: error instanceof ZodError ? error.errors : (error as any).validation || error.message,
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: error.name || 'Internal Server Error',
      statusCode,
      message: error.message || 'An unexpected error occurred',
    });
  });

  // Healthcheck Route
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Task API Routes
  app.register(taskRoutes, { prefix: '/api' });

  return app;
}
