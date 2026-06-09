import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { kdsApi } from "@core/api/kds";
import { toast } from "@shared/components/feedback/Toast";
import { ENV } from "@core/config/env";
import { getToken } from "@core/api/client";

const POLL_MS = 5_000;
const TOPIC   = "/topic/kds/orders";

const normalizeStatus = (s) => (s === 'RASCUNHO' ? 'PENDENTE' : s);

function buildWsUrl() {
  return ENV.API_BASE_URL.replace(/^http/, "ws") + "/ws";
}

export function useKdsSocket() {
  const [orders, setOrders]       = useState([]);
  const [removing, setRemoving]   = useState(new Set());
  const [connected, setConnected] = useState(false);
  const clientRef  = useRef(null);
  const pollRef    = useRef(null);

  const startPoll = useCallback((fetchFn) => {
    if (!pollRef.current) {
      pollRef.current = setInterval(fetchFn, POLL_MS);
    }
  }, []);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyUpdate = useCallback((order) => {
    const normalized = { ...order, status: normalizeStatus(order.status) };
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === normalized.id);
      if (idx === -1) return [...prev, normalized];
      const next = [...prev];
      next[idx] = normalized;
      return next;
    });
  }, []);

  const applyRemove = useCallback((orderId, finalStatus) => {
    // Pedido pronto → exibe "Pronto" por 5 s na cozinha, depois some com fade
    if (finalStatus === 'PRONTO') {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: 'PRONTO' } : o),
      );
      setTimeout(() => {
        setRemoving((prev) => new Set(prev).add(orderId));
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          setRemoving((prev) => { const s = new Set(prev); s.delete(orderId); return s; });
        }, 400);
      }, 5_000);
      return;
    }
    // Demais finalizações → remove imediatamente com animação de fade
    setRemoving((prev) => new Set(prev).add(orderId));
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setRemoving((prev) => {
        const s = new Set(prev);
        s.delete(orderId);
        return s;
      });
    }, 400);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const data = await kdsApi.getOrders();
      // PRONTO é exibido apenas via evento em tempo real (5 s); não recarregar em refresh
      const active = Array.isArray(data)
        ? data.filter((o) => o.status !== 'PRONTO').map((o) => ({ ...o, status: normalizeStatus(o.status) }))
        : [];
      setOrders(active);
    } catch {
      /* silencioso — backend pode estar offline */
    }
  }, []);

  useEffect(() => {
    fetchAll();

    let client;
    try {
      const token = getToken();
      client = new Client({
        brokerURL:      buildWsUrl(),
        reconnectDelay: 6000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        onConnect: () => {
          setConnected(true);
          stopPoll();
          client.subscribe(TOPIC, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              if (event.type === "UPDATE") applyUpdate(event.order);
              else if (event.type === "REMOVE") applyRemove(event.orderId, event.finalStatus);
            } catch { /* ignorar mensagem malformada */ }
          });
        },
        onDisconnect: () => {
          setConnected(false);
          startPoll(fetchAll);
        },
        onStompError: () => {
          setConnected(false);
          startPoll(fetchAll);
        },
        onWebSocketError: () => {
          setConnected(false);
          startPoll(fetchAll);
        },
      });
      client.activate();
    } catch {
      startPoll(fetchAll);
    }

    clientRef.current = client ?? null;

    return () => {
      stopPoll();
      try { clientRef.current?.deactivate(); } catch { /* ignorar */ }
    };
  }, [fetchAll, applyUpdate, applyRemove, startPoll, stopPoll]);

  return { orders, removing, connected, refetch: fetchAll };
}
