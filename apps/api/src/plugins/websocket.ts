import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth.js';
import { WsEventType } from '../../../../shared/schemas/index.js';

const workspaceRooms = new Map<string, Set<WebSocket>>();

export function subscribeClientToWorkspace(socket: WebSocket, workspaceId: string) {
  let room = workspaceRooms.get(workspaceId);
  if (!room) {
    room = new Set<WebSocket>();
    workspaceRooms.set(workspaceId, room);
  }
  room.add(socket);
}

export function unsubscribeClientFromWorkspace(socket: WebSocket, workspaceId: string) {
  const room = workspaceRooms.get(workspaceId);
  if (room) {
    room.delete(socket);
    if (room.size === 0) {
      workspaceRooms.delete(workspaceId);
    }
  }
}

export function removeClientFromAllRooms(socket: WebSocket) {
  for (const [workspaceId, room] of workspaceRooms.entries()) {
    room.delete(socket);
    if (room.size === 0) {
      workspaceRooms.delete(workspaceId);
    }
  }
}

export function broadcastToWorkspace(
  workspaceId: string,
  event: { type: WsEventType; workspaceId: string; payload: unknown; timestamp?: string }
) {
  const room = workspaceRooms.get(workspaceId);
  if (!room) return;

  const messageStr = JSON.stringify({
    type: event.type,
    workspaceId: event.workspaceId,
    payload: event.payload,
    timestamp: event.timestamp || new Date().toISOString(),
  });

  for (const socket of room) {
    if (socket.readyState === 1 /* WebSocket.OPEN */) {
      socket.send(messageStr);
    }
  }
}

export async function websocketRoutes(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket, req) => {
    let token: string | undefined;

    const query = req.query as Record<string, string> | undefined;
    if (query && typeof query.token === 'string') {
      token = query.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    } else if (typeof req.headers['sec-websocket-protocol'] === 'string') {
      token = req.headers['sec-websocket-protocol'];
    }

    if (!token) {
      socket.close(4001, 'Unauthorized');
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      socket.close(4001, 'Unauthorized');
      return;
    }

    if (decoded.workspaceId) {
      subscribeClientToWorkspace(socket, decoded.workspaceId);
    }

    socket.on('message', (rawMessage: Buffer | string) => {
      try {
        const data = JSON.parse(rawMessage.toString());
        const targetWorkspace = data.workspaceId || data.payload?.workspaceId;
        if (data.type === 'SUBSCRIBE' || data.type === 'join-room') {
          if (targetWorkspace) {
            subscribeClientToWorkspace(socket, targetWorkspace);
          }
        } else if (data.type === 'UNSUBSCRIBE' || data.type === 'leave-room') {
          if (targetWorkspace) {
            unsubscribeClientFromWorkspace(socket, targetWorkspace);
          }
        }
      } catch (err) {
        // Ignore malformed JSON
      }
    });

    socket.on('close', () => {
      removeClientFromAllRooms(socket);
    });

    socket.on('error', () => {
      removeClientFromAllRooms(socket);
    });
  });
}
