'use client';

import { useEffect, useState, useRef } from 'react';
import { WsMessage } from '@shared/schemas/index';

interface UseWebSocketOptions {
  workspaceId: string;
  token?: string | null;
  onEvent?: (message: WsMessage) => void;
  enabled?: boolean;
}

export function useWebSocket({
  workspaceId,
  token,
  onEvent,
  enabled = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !workspaceId) {
      setIsConnected(false);
      return;
    }

    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
    const wsUrl = token ? `${wsBaseUrl}?token=${encodeURIComponent(token)}` : wsBaseUrl;

    let socket: WebSocket | null = null;
    let isCancelled = false;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (isCancelled) return;
        setIsConnected(true);

        // Send workspace subscription event upon connection
        const subscribeMessage = {
          type: 'SUBSCRIBE',
          workspaceId,
        };
        socket?.send(JSON.stringify(subscribeMessage));
      };

      socket.onmessage = (event: MessageEvent) => {
        if (isCancelled) return;
        try {
          const message: WsMessage = JSON.parse(event.data);
          if (onEventRef.current) {
            onEventRef.current(message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message frame:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
      };

      socket.onclose = () => {
        if (isCancelled) return;
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to instantiate WebSocket:', err);
      setIsConnected(false);
    }

    return () => {
      isCancelled = true;
      if (socket) {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }
      setIsConnected(false);
    };
  }, [workspaceId, token, enabled]);

  return { isConnected };
}
