import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { ENV } from "@core/config/env";

const MOVEMENTS_TOPIC = "/topic/cashier/movements";
const SESSIONS_TOPIC  = "/topic/cashier/sessions";

function buildWsUrl() {
  return ENV.API_BASE_URL.replace(/^http/, "ws") + "/ws";
}

/**
 * Single WebSocket connection for all cashier real-time events.
 *
 * onMovement(movement) — called on NEW_MOVEMENT
 * onSession(event)     — called on OPENED / CLOSED session events
 */
export function useCashierSocket(onMovement, onSession) {
  const onMovementRef = useRef(onMovement);
  const onSessionRef  = useRef(onSession);
  onMovementRef.current = onMovement;
  onSessionRef.current  = onSession;

  useEffect(() => {
    let client;
    try {
      client = new Client({
        brokerURL: buildWsUrl(),
        reconnectDelay: 6000,
        onConnect: () => {
          client.subscribe(MOVEMENTS_TOPIC, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              if (event.type === "NEW_MOVEMENT" && event.movement) {
                onMovementRef.current?.(event.movement);
              }
            } catch { /* ignorar mensagem malformada */ }
          });
          client.subscribe(SESSIONS_TOPIC, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              onSessionRef.current?.(event);
            } catch { /* ignorar mensagem malformada */ }
          });
        },
        onStompError:    () => { /* reconecta automaticamente via reconnectDelay */ },
        onWebSocketError: () => { /* idem */ },
      });
      client.activate();
    } catch { /* WebSocket indisponível — React Query polling cobre */ }

    return () => {
      try { client?.deactivate(); } catch { /* ignorar */ }
    };
  }, []); // sem deps — callbacks lidos via ref
}
