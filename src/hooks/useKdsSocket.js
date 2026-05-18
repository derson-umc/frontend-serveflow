import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { kdsApi } from "../services/api/kds";
import { toast } from "../components/ui/Toast";

const POLL_MS = 5_000;
const TOPIC   = "/topic/kds/orders";

function buildWsUrl() {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api")
    .replace(/^http/, "ws");
  return `${base}/ws`;
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
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx === -1) return [...prev, order];
      const next = [...prev];
      next[idx] = order;
      return next;
    });
  }, []);

  const applyRemove = useCallback((orderId) => {
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
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      /* silencioso — backend pode estar offline */
    }
  }, []);

  useEffect(() => {
    fetchAll();

    let client;
    try {
      client = new Client({
        brokerURL: buildWsUrl(),
        reconnectDelay: 6000,
        onConnect: () => {
          setConnected(true);
          stopPoll();
          client.subscribe(TOPIC, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              if (event.type === "UPDATE") applyUpdate(event.order);
              else if (event.type === "REMOVE") applyRemove(event.orderId);
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
