import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { ENV } from "@core/config/env";
import { getToken } from "@core/api/client";

const TOPIC = "/topic/caixa";

function buildWsUrl() {
  return ENV.API_BASE_URL.replace(/^http/, "ws") + "/ws";
}

export function useCashierSocket(onMovement, onSession, onBillClose) {
  const onMovementRef  = useRef(onMovement);
  const onSessionRef   = useRef(onSession);
  const onBillCloseRef = useRef(onBillClose);
  onMovementRef.current  = onMovement;
  onSessionRef.current   = onSession;
  onBillCloseRef.current = onBillClose;

  useEffect(() => {
    let client;
    try {
      const token = getToken();
      client = new Client({
        brokerURL:      buildWsUrl(),
        reconnectDelay: 6000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        onConnect: () => {
          client.subscribe(TOPIC, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              switch (event.event) {
                case "CASH_MOVEMENT":
                  onMovementRef.current?.(event.movement);
                  break;
                case "SESSION_OPENED":
                case "SESSION_CLOSED":
                  onSessionRef.current?.(event);
                  break;
                case "BILL_CLOSE_REQUESTED":
                  onBillCloseRef.current?.(event);
                  break;
                default:
                  break;
              }
            } catch { /* ignorar mensagem malformada */ }
          });
        },
        onStompError:     () => {},
        onWebSocketError: () => {},
      });
      client.activate();
    } catch { /* WebSocket indisponível — React Query polling cobre */ }

    return () => {
      try { client?.deactivate(); } catch { /* ignorar */ }
    };
  }, []);
}
