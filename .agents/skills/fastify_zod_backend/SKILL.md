---
name: fastify_zod_backend
description: Fastify backend development with Zod schema validation, type provider integration, fail-fast 422 error handling, and route modularization.
---

# Fastify & Zod Backend Development Skill

This skill governs backend server design, REST API route creation, Zod schema validation, and error handling for Fastify applications.

## 1. Type-Safe Fastify Setup
- Initialize Fastify instances with Zod Type Provider:
  ```ts
  const app = fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  ```

## 2. Fail-Fast 422 Validation Error Handler
- Enforce fail-fast input validation. Catch `ZodError` or payload validation failures in `app.setErrorHandler` and return HTTP 422 Unprocessable Entity:
  ```json
  {
    "error": "Unprocessable Entity",
    "statusCode": 422,
    "message": "Invalid input payload validation failed",
    "details": [...]
  }
  ```

## 3. Schema-Driven Route Specifications
- Define request bodies, path params, query strings, and response schemas using shared Zod schemas (`shared/schemas/`).

## 4. Hook & Plugin Encapsulation
- Register plugins and decorators for CORS (`@fastify/cors`), Auth (`@fastify/jwt`), WebSockets (`@fastify/websocket`), and route controllers.
