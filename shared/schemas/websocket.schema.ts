import { z } from 'zod';

/**
 * Real-Time WebSocket Gateway Event Types
 */
export const WsEventTypeEnum = z.enum([
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_DELETED',
  'ACTIVITY_LOGGED',
  'SUBSCRIBE',
  'UNSUBSCRIBE',
  'ERROR',
]);
export type WsEventType = z.infer<typeof WsEventTypeEnum>;

/**
 * Workspace Room Subscription Payload Schema
 */
export const WsSubscribePayloadSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});
export type WsSubscribePayload = z.infer<typeof WsSubscribePayloadSchema>;

/**
 * Standard Real-Time WebSocket Broadcast & Event Message Schema
 */
export const WsMessageSchema = z.object({
  type: WsEventTypeEnum,
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  payload: z.unknown(),
  timestamp: z.string().datetime(),
});
export type WsMessage = z.infer<typeof WsMessageSchema>;
