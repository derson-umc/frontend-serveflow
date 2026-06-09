import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook para estado persistido em sessionStorage (sobrevive navegação, limpa ao fechar aba)
function useSessionState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const setAndPersist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [state, setAndPersist];
}

import Sidebar          from '@shared/components/layout/Sidebar';
import { MenuTabBar }   from './components/MenuTabBar';
import { CategoryBar }  from './components/CategoryBar';
import { ProductGrid }  from './components/ProductGrid';
import { ExtrasModal }  from './components/ExtrasModal';
import { CartPanel }    from './components/cart/CartPanel';
import { OrderTypeForm } from './components/cart/OrderTypeForm';
import { OrderList }    from './components/orders/OrderList';
import { EditOrderModal } from '@shared/components/ui/EditOrderModal';
import { PrintModal }   from './components/orders/PrintModal';

import { useCartStore, selectCartTotal, selectCartIsEmpty } from '@features/menu/store/useCartStore';
import { useAuthStore }   from '@features/auth/store/useAuthStore';
import { useProducts }    from '@features/products/hooks/useProducts';
import { useCreateOrder } from './hooks/useCreateOrder';
import { useCancelOrder } from './hooks/useOrders';
import { ordersApi }      from '@core/api/orders';
import { useOrdersKdsSync } from './hooks/useOrdersKdsSync';
import { toast }          from '@shared/components/feedback/Toast';

export default function Menu() {
  const navigate   = useNavigate();
  const gridRef    = useRef(null);
  const user       = useAuthStore((s) => s.user);
  const operator   = user?.name ?? user?.username ?? null;

  // ── Cart ──────────────────────────────────────────────────────────────────
  const items        = useCartStore((s) => s.items);
  const extras       = useCartStore((s) => s.extras);
  const observations = useCartStore((s) => s.observations);
  const total        = useCartStore(selectCartTotal);
  const isEmpty      = useCartStore(selectCartIsEmpty);
  const addItem      = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart    = useCartStore((s) => s.clear);
  const setExtras    = useCartStore((s) => s.setExtras);
  const setObservation = useCartStore((s) => s.setObservation);

  const createOrder = useCreateOrder();
  const cancelOrder = useCancelOrder();

  // ── Produtos ──────────────────────────────────────────────────────────────
  const { data: rawProducts = [], isLoading } = useProducts();

  const products = useMemo(
    () => rawProducts.map((p) => ({
      id:              p.id,
      name:            p.name,
      desc:            p.description,
      price:           Number(p.price),
      category:        p.category ?? 'Outros',
      imageUrl:        p.imageUrl ?? null,
      outOfStock:      p.active === false,
      productCategory: p.productCategory ?? null,
    })),
    [rawProducts],
  );

  const categories = useMemo(() => {
    const toTitleCase = (s) =>
      String(s ?? '').toLowerCase().replace(/(^|\s|-|\/)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase());
    const seen = new Map();
    products.forEach((p) => {
      const label = toTitleCase(p.category);
      const k = label.trim().toLowerCase();
      if (k && !seen.has(k)) seen.set(k, label);
    });
    return ['TODOS', ...[...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [products]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState('venda');
  const [activeCategory,  setActiveCategory]  = useState('TODOS');
  const [search,          setSearch]          = useState('');
  const [tipoVenda,       setTipoVenda]       = useState('comanda');
  const [detalhes,        setDetalhes]        = useState({ nome: '', numero: '' });
  const [endereco,        setEndereco]        = useState({ cep: '', logradouro: '', numero: '', complemento: '' });
  const [extrasModal,     setExtrasModal]     = useState(null);
  const [printTarget,     setPrintTarget]     = useState(null);
  const [printType,       setPrintType]       = useState(null);
  const [editTarget,      setEditTarget]      = useState(null);
  const [editType,        setEditType]        = useState(null);

  // ── Pedidos em sessionStorage ─────────────────────────────────────────────
  const [comandas,   setComandas]   = useSessionState('sf-comandas-v1',   []);
  const [deliveries, setDeliveries] = useSessionState('sf-deliveries-v1', []);

  // Lista unificada com _tipo injetado
  // normalizeStatus: compatibilidade com dados em sessionStorage ou backend ainda com enum antigo
  const normalizeStatus = (s) => (s === 'RASCUNHO' ? 'PENDENTE' : s);
  const allOrdersRaw = useMemo(() => [
    ...comandas.map((c)   => ({ ...c, _tipo: 'comanda',  status: normalizeStatus(c.status) })),
    ...deliveries.map((d) => ({ ...d, _tipo: 'delivery', status: normalizeStatus(d.status) })),
  ], [comandas, deliveries]);

  // Status KDS em tempo real via WebSocket (com fallback para polling)
  const { orders: allOrders, connected: kdsConnected, statusMap } = useOrdersKdsSync(allOrdersRaw);

  // Persiste mudanças de status e comandaStatus de volta ao sessionStorage
  useEffect(() => {
    if (!statusMap || Object.keys(statusMap).length === 0) return;
    const applyLive = (o) => {
      const live = statusMap[String(o.id)];
      if (!live) return o;
      const liveStatus   = typeof live === 'object' ? live.status        : live;
      const liveComanda  = typeof live === 'object' ? live.comandaStatus : null;
      const changed = (liveStatus && liveStatus !== o.status) ||
                      (liveComanda && liveComanda !== o.comandaStatus);
      if (!changed) return o;
      return {
        ...o,
        ...(liveStatus  ? { status:        liveStatus  } : {}),
        ...(liveComanda ? { comandaStatus: liveComanda } : {}),
      };
    };
    setComandas((prev)   => prev.map(applyLive));
    setDeliveries((prev) => prev.map(applyLive));
  }, [statusMap, setComandas, setDeliveries]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFinalizarVenda = useCallback(async () => {
    if (tipoVenda === 'pagamento') {
      const itensVendidos = items.map((item) => ({
        id: item.id, name: item.name, quantity: item.quantity,
        price: item.price, total: item.price * item.quantity,
      }));
      sessionStorage.setItem('tipoVenda',      tipoVenda);
      sessionStorage.setItem('detalhesVenda',  JSON.stringify(detalhes));
      sessionStorage.setItem('totalVenda',     total);
      sessionStorage.setItem('itensVenda',     JSON.stringify(itensVendidos));
      clearCart();
      navigate('/pagamento');
      return;
    }

    const orderItems = items.map((item) => ({
      productId:       item.id,
      productName:     item.name,
      quantity:        item.quantity,
      unitPrice:       item.price,
      observation:     observations[item.id] || null,
      productCategory: item.productCategory   || null,
      additionals:     (extras[item.id] || []).map((e) => ({
        name: e.name, quantity: Number(e.quantity), unitPrice: Number(e.unitPrice),
      })),
    }));

    if (tipoVenda === 'comanda') {
      // ── Validação: mesa duplicada ──────────────────────────────────────
      const mesaInput = String(detalhes.numero ?? '').trim();
      if (mesaInput) {
        const mesaJaAberta = comandas.some(
          (c) => String(c.mesa ?? '').trim() === mesaInput &&
                 (c.comandaStatus ?? 'ABERTA') !== 'FECHADA' &&
                 (c.status ?? 'PENDENTE') !== 'CANCELADO',
        );
        if (mesaJaAberta) {
          toast.error(`Mesa ${mesaInput} já possui uma comanda aberta.`);
          return;
        }
      }
      // ──────────────────────────────────────────────────────────────────

      const customerName = detalhes.nome    || `Mesa ${comandas.length + 1}`;
      const tableNumber  = detalhes.numero  || null;
      const orderType    = tableNumber ? 'MESA' : 'BALCAO';
      try {
        const res = await createOrder.mutateAsync({
          customerName, type: orderType, tableNumber,
          observation: '', paymentMethod: null, items: orderItems,
        });
        setComandas((prev) => [
          ...prev,
          {
            ...res,
            mesa:  detalhes.numero || detalhes.nome || `Mesa ${comandas.length + 1}`,
            itens: (res.items ?? []).map((i) => ({
              id:              i.id,
              productId:       i.productId,
              name:            i.productName,
              quantity:        i.quantity,
              price:           Number(i.unitPrice),
              total:           Number(i.total),
              observation:     i.observation ?? '',
              productCategory: i.productCategory ?? null,
            })),
            total: Number(res.totalValue),
            data:  new Date(res.createdAt).toLocaleString('pt-BR'),
          },
        ]);
        toast.success('Comanda registrada com sucesso');
      } catch (err) {
        const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
        toast.error(msg ?? 'Erro ao registrar comanda.');
        return;
      }
      setDetalhes({ nome: '', numero: '' });

    } else if (tipoVenda === 'delivery') {
      const customerName = detalhes.nome || `Cliente ${deliveries.length + 1}`;
      try {
        const res = await createOrder.mutateAsync({
          customerName, type: 'DELIVERY', observation: '', paymentMethod: null, items: orderItems,
          address: {
            cep:        endereco.cep        || null,
            street:     endereco.logradouro || null,
            number:     endereco.numero     || null,
            complement: endereco.complemento || null,
          },
        });
        const enderecoCompleto = [
          res.address?.street      ?? endereco.logradouro,
          res.address?.number      ?? endereco.numero,
          res.address?.complement  ?? endereco.complemento,
        ].filter(Boolean).join(', ');
        setDeliveries((prev) => [
          ...prev,
          {
            ...res,
            nome:     res.customerName,
            endereco: enderecoCompleto,
            itens: (res.items ?? []).map((i) => ({
              id:              i.id,
              productId:       i.productId,
              name:            i.productName,
              quantity:        i.quantity,
              price:           Number(i.unitPrice),
              total:           Number(i.total),
              observation:     i.observation ?? '',
              productCategory: i.productCategory ?? null,
            })),
            total: Number(res.totalValue),
            data:  new Date(res.createdAt).toLocaleString('pt-BR'),
          },
        ]);
        toast.success('Delivery registrado com sucesso');
        setEndereco({ cep: '', logradouro: '', numero: '', complemento: '' });
      } catch (err) {
        const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
        toast.error(msg ?? 'Erro ao registrar delivery.');
        return;
      }
      setDetalhes({ nome: '', numero: '' });
    }

    clearCart();
    setActiveTab('pedidos');
  }, [tipoVenda, items, extras, total, detalhes, endereco, comandas.length, deliveries.length, clearCart, navigate, createOrder, setComandas, setDeliveries]);

  // Remove da lista local sem chamar a API (para ENTREGUE e CANCELADO)
  const handleLimpar = useCallback((id, type) => {
    if (type === 'comanda') setComandas((prev)   => prev.filter((c) => c.id !== id));
    else                    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  }, [setComandas, setDeliveries]);

  // Auto-remove somente quando a comanda é fechada (pagamento concluído via WebSocket/polling)
  useEffect(() => {
    const ids = new Set(
      allOrders
        .filter((o) => (o.comandaStatus ?? 'ABERTA') === 'FECHADA')
        .map((o) => o.id),
    );
    if (ids.size === 0) return;
    setComandas((prev)   => prev.filter((c) => !ids.has(c.id)));
    setDeliveries((prev) => prev.filter((d) => !ids.has(d.id)));
  }, [allOrders, setComandas, setDeliveries]);

  // Ao montar: remove pedidos já liquidados enquanto o componente estava desmontado
  // (o usuário estava na rota do caixa quando o pagamento foi confirmado).
  useEffect(() => {
    try {
      const settled = JSON.parse(sessionStorage.getItem('sf-settled-orders') || '[]');
      if (settled.length === 0) return;
      const ids = new Set(settled.map(String));
      setComandas((prev)   => prev.filter((c) => !ids.has(String(c.id))));
      setDeliveries((prev) => prev.filter((d) => !ids.has(String(d.id))));
      sessionStorage.removeItem('sf-settled-orders');
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Remove imediatamente quando o caixa confirma o pagamento (CustomEvent direto,
  // sem depender de WebSocket ou polling — funciona quando ambas as rotas estão montadas).
  useEffect(() => {
    const handleSettled = (e) => {
      const orderId = e.detail?.orderId;
      if (!orderId) return;
      const id = String(orderId);
      setComandas((prev)   => prev.filter((c) => String(c.id) !== id));
      setDeliveries((prev) => prev.filter((d) => String(d.id) !== id));
      // Garante que o ID também sai da lista persistida (caso seja consumido via evento)
      try {
        const prev = JSON.parse(sessionStorage.getItem('sf-settled-orders') || '[]');
        sessionStorage.setItem('sf-settled-orders', JSON.stringify(prev.filter((s) => s !== id)));
      } catch {}
    };
    window.addEventListener('sf:order-settled', handleSettled);
    return () => window.removeEventListener('sf:order-settled', handleSettled);
  }, [setComandas, setDeliveries]);

  const allOrdersRef  = useRef([]);
  useEffect(() => { allOrdersRef.current = allOrders; }, [allOrders]);

  const handleLimparFinalizados = useCallback(() => {
    const idsToRemove = new Set(
      allOrdersRef.current
        .filter((o) => (o.comandaStatus ?? 'ABERTA') === 'FECHADA' || (o.status ?? '') === 'CANCELADO')
        .map((o) => o.id),
    );
    if (idsToRemove.size === 0) return;
    setComandas((prev)   => prev.filter((c) => !idsToRemove.has(c.id)));
    setDeliveries((prev) => prev.filter((d) => !idsToRemove.has(d.id)));
  }, [setComandas, setDeliveries]);

  const handleCancelar = useCallback(async (id, type, reason) => {
    const isLocal = typeof id === 'number';
    if (!isLocal) {
      try {
        await cancelOrder.mutateAsync({ id, reason: reason || null });
        toast.success('Pedido cancelado.');
      } catch (err) {
        toast.error(err.message ?? 'Erro ao cancelar.');
        return;
      }
    }
    if (type === 'comanda') setComandas((prev) => prev.filter((c) => c.id !== id));
    else                    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  }, [cancelOrder, setComandas, setDeliveries]);

  const handleFecharConta = useCallback(async (order, type) => {
    const isLocal = typeof order.id === 'number';

    if (!isLocal && order.id) {
      // Pedido com UUID real: transiciona para AGUARDANDO_PAGAMENTO e
      // mantém na lista mostrando "Em fechamento" até o caixa liquidar
      try {
        await ordersApi.requestPayment(order.id);
        toast.success('Conta enviada para o caixa.');
        const markClosing = (prev) => prev.map((o) =>
          o.id === order.id
            ? { ...o, status: 'AGUARDANDO_PAGAMENTO', comandaStatus: 'EM_FECHAMENTO' }
            : o,
        );
        if (type === 'comanda') setComandas(markClosing);
        else                    setDeliveries(markClosing);
      } catch (err) {
        const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? 'Erro ao solicitar pagamento.';
        toast.error(msg);
      }
    } else {
      // Pedido local (sem UUID): fluxo de pagamento direto
      sessionStorage.setItem('tipoVenda',     type);
      sessionStorage.setItem('detalhesVenda', JSON.stringify({
        nome:   type === 'comanda' ? order.mesa    : order.nome,
        numero: type === 'comanda' ? ''            : order.endereco,
      }));
      sessionStorage.setItem('totalVenda', order.total);
      sessionStorage.setItem('itensVenda', JSON.stringify(order.itens));
      navigate('/pagamento');
      if (type === 'comanda') setComandas((prev)   => prev.filter((c) => c.id !== order.id));
      else                    setDeliveries((prev) => prev.filter((d) => d.id !== order.id));
    }
  }, [navigate, setComandas, setDeliveries]);

  const handleSaveEdit = useCallback(async (updated) => {
    const isPendente = updated.status === 'PENDENTE';
    const hasRealId  = updated.id && typeof updated.id !== 'number';

    if (isPendente && hasRealId) {
      try {
        // Busca o pedido no backend para garantir productId correto em todos os itens.
        // Necessário para comandas criadas antes de o campo productId ser persistido localmente.
        const fresh = await ordersApi.get(updated.id);
        const freshById = Object.fromEntries(
          (fresh.items ?? []).map((i) => [i.id, i])
        );

        const payload = updated.itens.map((i) => {
          const backendItem = freshById[i.id];
          return {
            productId:       i.productId ?? backendItem?.productId,
            productName:     i.name,
            quantity:        i.quantity,
            unitPrice:       i.price,
            observation:     i.observation || null,
            productCategory: i.productCategory ?? backendItem?.productCategory ?? null,
            additionals:     [],
          };
        });

        if (payload.some((p) => !p.productId)) {
          toast.error('Não foi possível identificar o produto de um ou mais itens. Feche e recrie o pedido.');
          return;
        }

        const res = await ordersApi.updateItems(updated.id, payload);
        const synced = {
          ...updated,
          itens: (res.items ?? []).map((i) => ({
            id:              i.id,
            productId:       i.productId,
            name:            i.productName,
            quantity:        i.quantity,
            price:           Number(i.unitPrice),
            total:           Number(i.total),
            observation:     i.observation ?? '',
            productCategory: i.productCategory ?? null,
          })),
          total: Number(res.totalValue),
        };
        if (editType === 'comanda') setComandas((prev)   => prev.map((c) => c.id === synced.id ? synced : c));
        else                        setDeliveries((prev) => prev.map((d) => d.id === synced.id ? synced : d));
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'Erro ao atualizar pedido.');
        return;
      }
    } else {
      if (editType === 'comanda') setComandas((prev)   => prev.map((c) => c.id === updated.id ? updated : c));
      else                        setDeliveries((prev) => prev.map((d) => d.id === updated.id ? updated : d));
    }

    setEditTarget(null);
  }, [editType, setComandas, setDeliveries]);

  const handleAddItemsToOrder = useCallback((updatedOrder) => {
    if (!updatedOrder || !editType) return;
    const mapped = {
      ...updatedOrder,
      mesa:  updatedOrder.tableNumber || updatedOrder.customerName,
      nome:  updatedOrder.customerName,
      itens: (updatedOrder.items ?? []).map((i) => ({
        id:              i.id,
        productId:       i.productId,
        name:            i.productName,
        quantity:        i.quantity,
        price:           Number(i.unitPrice),
        total:           Number(i.total),
        observation:     i.observation ?? '',
        productCategory: i.productCategory ?? null,
        itemStatus:      i.status ?? null,
      })),
      total: Number(updatedOrder.totalValue ?? updatedOrder.total),
      data:  updatedOrder.createdAt ? new Date(updatedOrder.createdAt).toLocaleString('pt-BR') : undefined,
    };
    if (editType === 'comanda') setComandas((prev)   => prev.map((c) => c.id === mapped.id ? { ...c, ...mapped } : c));
    else                        setDeliveries((prev) => prev.map((d) => d.id === mapped.id ? { ...d, ...mapped } : d));
  }, [editType, setComandas, setDeliveries]);

  const handleSaveExtras = useCallback((productId, newExtras) => {
    setExtras(productId, newExtras);
    setExtrasModal(null);
  }, [setExtras]);

  const orderForm = (
    <OrderTypeForm
      tipoVenda={tipoVenda}
      onTipoChange={setTipoVenda}
      detalhes={detalhes}
      onDetalhesChange={setDetalhes}
      endereco={endereco}
      onEnderecoChange={setEndereco}
    />
  );

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)', height: '100vh' }}>
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-hidden">
        {/* ── Abas: Vendas | Pedidos ── */}
        <MenuTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          pedidosCount={allOrders.length}
        />

        {/* ── Aba: Vendas ── */}
        {activeTab === 'venda' && (
          <div className="flex flex-1 overflow-hidden">
            <div
              className="flex flex-col flex-1 overflow-hidden"
              style={{ borderRight: !isEmpty ? '1px solid var(--color-border)' : 'none' }}
            >
              <CategoryBar
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                productGridRef={gridRef}
              />
              <ProductGrid
                ref={gridRef}
                items={products}
                loading={isLoading}
                search={search}
                activeCategory={activeCategory}
                onAdd={(item) => addItem(item)}
              />
            </div>

            <CartPanel
              items={items}
              extras={extras}
              observations={observations}
              total={total}
              customerName={detalhes.nome || null}
              tableNumber={tipoVenda === 'comanda' ? detalhes.numero || null : null}
              onIncrease={(id, qty)   => updateQuantity(id, qty)}
              onDecrease={(id, qty)   => updateQuantity(id, qty)}
              onRemove={(id)          => updateQuantity(id, 0)}
              onEditExtras={(item)    => setExtrasModal(item)}
              onObservationChange={setObservation}
              onClear={clearCart}
              onFinalize={handleFinalizarVenda}
              orderForm={orderForm}
              finalizeDisabled={isEmpty}
              deliveryMode={tipoVenda === 'delivery'}
            />
          </div>
        )}

        {/* ── Aba: Pedidos (Comandas + Delivery unificados) ── */}
        {activeTab === 'pedidos' && (
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--color-bg)' }}>
            <OrderList
              orders={allOrders}
              onPrint={(o)              => { setPrintTarget(o); setPrintType(o._tipo); }}
              onEdit={(o, tipo)         => { setEditTarget(o);  setEditType(tipo);     }}
              onFecharConta={(o, tipo)  => handleFecharConta(o, tipo)}
              onCancelar={(id, tipo, r) => handleCancelar(id, tipo, r)}
              onLimpar={(id, tipo)      => handleLimpar(id, tipo)}
              onLimparFinalizados={handleLimparFinalizados}
            />
          </div>
        )}
      </div>

      {/* ── Modais ── */}
      {extrasModal && (
        <ExtrasModal
          cartItem={extrasModal}
          initialExtras={extras[extrasModal.id] || []}
          onSave={handleSaveExtras}
          onClose={() => setExtrasModal(null)}
        />
      )}

      <PrintModal
        open={!!printTarget}
        order={printTarget}
        operator={operator}
        onClose={() => { setPrintTarget(null); setPrintType(null); }}
      />

      {editTarget && (
        <EditOrderModal
          open
          order={editTarget}
          type={editType}
          existingTables={comandas}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
          onAddItems={handleAddItemsToOrder}
        />
      )}
    </div>
  );
}
