import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../../../../shared/schemas/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-secret-key-sprint-3';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Optional Authentication Hook:
 * Inspects Authorization Bearer token header if present.
 * Attaches request.user if valid.
 * Returns 401 if token is malformed/invalid when provided.
 */
export async function authenticateOptional(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({
      error: 'Unauthorized',
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * RBAC PreHandler Decorator:
 * Checks if request.user.role is within allowed roles.
 * Returns 403 Forbidden if user is authenticated with insufficient permissions.
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user) {
      if (!allowedRoles.includes(request.user.role as UserRole)) {
        return reply.status(403).send({
          error: 'Forbidden',
          statusCode: 403,
          message: 'Insufficient role permissions',
        });
      }
    }
  };
}
