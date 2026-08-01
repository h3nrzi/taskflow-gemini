import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { JWT_SECRET } from '../plugins/auth.js';
import {
  RegisterInputSchema,
  LoginInputSchema,
  RegisterInput,
  LoginInput,
} from '../../../../shared/schemas/index.js';

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/auth/register — User Registration (STORY-008)
   */
  typedApp.post(
    '/auth/register',
    {
      schema: {
        body: RegisterInputSchema,
      },
    },
    async (request, reply) => {
      const body = request.body as RegisterInput;
      const { email, password, name } = body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(409).send({
          error: 'Conflict',
          statusCode: 409,
          message: 'Email already registered',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'MEMBER',
          workspaceId: 'default-workspace',
        },
      });

      return reply.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId,
        createdAt: user.createdAt.toISOString(),
      });
    }
  );

  /**
   * POST /api/auth/login — User Login (STORY-008)
   */
  typedApp.post(
    '/auth/login',
    {
      schema: {
        body: LoginInputSchema,
      },
    },
    async (request, reply) => {
      const body = request.body as LoginInput;
      const { email, password } = body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(401).send({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.status(401).send({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      return reply.status(200).send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspaceId,
          createdAt: user.createdAt.toISOString(),
        },
      });
    }
  );

  /**
   * GET /api/auth/me — Active User Profile Validation (STORY-008)
   */
  typedApp.get('/auth/me', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        statusCode: 401,
        message: 'Missing or invalid authorization header',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        statusCode: 401,
        message: 'User not found',
      });
    }

    return reply.status(200).send({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      createdAt: user.createdAt.toISOString(),
    });
  });
}
