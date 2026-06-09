import { useCallback, useEffect, useRef, useState } from 'react';
import { Client }    from '@stomp/stompjs';
import { ENV }       from '@core/config/env';
import { getToken }  from '@core/api/client';
import { kdsApi }    from '@core/api/kds';
import { ordersApi } from '@core/api/orders';

const TOPIC   = '/topic/kds/orders';
const POLL_MS = 6_000;

const IN_PROGRESS_STATUSES = new Set(['PENDENTE', 'ENVIADO', 'EM_PREPARO']);

const normalizeStatus = (s) => (s === 'RASCUNHO' ? 'PENDENTE' : s);

function buildWsUrl() {
  return ENV.API_BASE_URL.replace(/^http/, 'ws') + '/ws';
}

// statusMap: { orderId: { status, comandaStatus } }
export function useOrdersKdsSync(orders) {
  const [statusMap, setStatusMap] = useState({});
  const [connected, setConnected] = useState(false);

  const statusMapRef = useRef({});
  useEffect(() => { statusMapRef.current = statusMap; }, [statusMap]);

  const clientRef = useRef(null);
  const pollRef   = useRef(null);

  const applyUpdate = useCallback((kdsOrder) => {
    if (!kdsOrder?.id) return;
    setStatusMap((prev) => ({
      ...prev,
      [String(kdsOrder.id)]: {
        status:        normalizeStatus(kdsOrder.status),
        comandaStatus: kdsOrder.comandaStatus ?? 'ABERTA',
      },
    }));
  }, []);

  const applyRemove = useCallback(async (orderId, finalStatus) => {
    if (!orderId) return;
    const id = String(orderId);
    try {
      const order = await ordersApi.get(id);
      if (order?.status) {
        setStatusMap((prev) => ({
          ...prev,
          [id]: {
            status:        normalizeStatus(order.status),
            comandaStatus: order.comandaStatus ?? 'ABERTA',
          },
        }));
      }
    } catch {
      // backend offline — usa finalStatus como fallback
      if (finalStatus) {
        setStatusMap((prev) => ({
          ...prev,
          [id]: {
            status:        normalizeStatus(finalStatus),
            comandaStatus: finalStatus === 'ENTREGUE' ? 'FECHADA' : 'ABERTA',
          },
        }));
      }
    }
  }, []);

  const startPoll = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const active = await kdsApi.getOrders();
        if (!Array.isArray(active)) return;
        const activeIds = new Set(active.map((o) => String(o.id)));
        setStatusMap((prev) => {
          const next = { ...prev };
          active.forEach((o) => {
            if (o.id && o.status) {
              next[String(o.id)] = {
                status:        normalizeStatus(o.status),
                comandaStatus: o.comandaStatus ?? 'ABERTA',
              };
            }
          });
          return next;
        });
        const stuckIds = Object.entries(statusMapRef.current)
          .filter(([id, entry]) => {
            const s = typeof entry === 'object' ? entry.status : entry;
            return IN_PROGRESS_STATUSES.has(s) && !activeIds.has(id);
          })
          .map(([id]) => id);
        for (const id of stuckIds) {
          ordersApi.get(id)
            .then((order) => {
              if (order?.status && !IN_PROGRESS_STATUSES.has(order.status)) {
                setStatusMap((prev) => ({
                  ...prev,
                  [id]: {
                    status:        order.status,
                    comandaStatus: order.comandaStatus ?? 'ABERTA',
                  },
                }));
              }
            })
            .catch(() => {});
        }
      } catch {}
    }, POLL_MS);
  }, []);

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const syncFromApi = useCallback(() => {
    kdsApi.getOrders()
      .then((active) => {
        if (!Array.isArray(active)) return;
        setStatusMap((prev) => {
          const next = { ...prev };
          active.forEach((o) => {
            if (o.id && o.status) {
              next[String(o.id)] = {
                status:        normalizeStatus(o.status),
                comandaStatus: o.comandaStatus ?? 'ABERTA',
              };
            }
          });
          return next;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    syncFromApi();

    const token = getToken();

    const client = new Client({
      brokerURL:        buildWsUrl(),
      reconnectDelay:   6_000,
      connectHeaders:   token ? { Authorization: `Bearer ${token}` } : {},

      onConnect: () => {
        setConnected(true);
        stopPoll();
        syncFromApi();
        client.subscribe(TOPIC, (msg) => {
          try {
            const event = JSON.parse(msg.body);
            if (event.type === 'UPDATE') applyUpdate(event.order);
            else if (event.type === 'REMOVE') applyRemove(event.orderId, event.finalStatus);
          } catch { /* mensagem malformada */ }
        });
      },

      onDisconnect:     () => { setConnected(false); startPoll(); },
      onStompError:     () => { setConnected(false); startPoll(); },
      onWebSocketError: () => { setConnected(false); startPoll(); },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      stopPoll();
      try { clientRef.current?.deactivate(); } catch {}
    };
  }, [applyUpdate, applyRemove, startPoll, stopPoll]);

  const ordersWithStatus = orders.map((order) => {
    const live = statusMap[String(order.id)];
    if (!live) return order;
    const liveStatus        = typeof live === 'object' ? live.status        : live;
    const liveComandaStatus = typeof live === 'object' ? live.comandaStatus : null;
    return {
      ...order,
      ...(liveStatus        ? { status:        liveStatus        } : {}),
      ...(liveComandaStatus ? { comandaStatus: liveComandaStatus } : {}),
    };
  });

  return { orders: ordersWithStatus, connected, statusMap };
}
