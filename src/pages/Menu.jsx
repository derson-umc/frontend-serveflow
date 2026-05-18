import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { MenuTabBar } from '../components/menu/MenuTabBar';
import { CategoryBar } from '../components/menu/CategoryBar';
import { ProductGrid } from '../components/menu/ProductGrid';
import { ExtrasModal } from '../components/menu/ExtrasModal';
import { CartPanel } from '../components/cart/CartPanel';
import { OrderTypeForm } from '../components/cart/OrderTypeForm';
import { OrderCard } from '../components/orders/OrderCard';
import { EditOrderModal } from '../components/ui/EditOrderModal';
import { PrintModal } from '../components/orders/PrintModal';
import { EmptyState } from '../components/ui/EmptyState';
import { useCartStore, selectCartTotal, selectCartIsEmpty } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProducts } from '../hooks/useProducts';
import { ordersApi } from '../services/api/orders';
import { toast } from '../components/ui/Toast';

const INBOX_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M7 13l-1-5h13" />
  </svg>
);

export default function Menu() {
  const navigate = useNavigate();
  const productGridRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const operator = user?.name ?? user?.username ?? null;

  /* ── Cart (Zustand) ─────────────────────────────────────── */
  const items = useCartStore((s) => s.items);
  const extras = useCartStore((s) => s.extras);
  const total = useCartStore(selectCartTotal);
  const isEmpty = useCartStore(selectCartIsEmpty);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clear);
  const setExtras = useCartStore((s) => s.setExtras);

  /* ── Data ────────────────────────────────────────────────── */
  const { data: rawProducts = [], isLoading } = useProducts();

  const products = useMemo(
    () =>
      rawProducts.map((p) => ({
        id: p.id,
        name: p.name,
        desc: p.description,
        price: Number(p.price),
        category: p.category ?? 'Outros',
        imageUrl: p.imageUrl ?? null,
        outOfStock: p.active === false,
      })),
    [rawProducts]
  );

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
    return ['TODOS', ...cats];
  }, [products]);

  /* ── UI state ────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('venda');
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [tipoVenda, setTipoVenda] = useState('comanda');
  const [detalhes, setDetalhes] = useState({ nome: '', numero: '' });
  const [endereco, setEndereco] = useState({ cep: '', logradouro: '', numero: '', complemento: '' });
  const [extrasModal, setExtrasModal] = useState(null);

  /* ── Orders state ───────────────────────────────────────── */
  const [comandas, setComandas] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [printTarget, setPrintTarget] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editType, setEditType] = useState(null);

  /* ── Finalize order ─────────────────────────────────────── */
  const handleFinalizarVenda = useCallback(async () => {
    if (tipoVenda === 'pagamento') {
      const itensVendidos = items.map((item) => ({
        id: item.id, name: item.name, quantity: item.quantity,
        price: item.price, total: item.price * item.quantity,
      }));
      localStorage.setItem('tipoVenda', tipoVenda);
      localStorage.setItem('detalhesVenda', JSON.stringify(detalhes));
      localStorage.setItem('totalVenda', total);
      localStorage.setItem('itensVenda', JSON.stringify(itensVendidos));
      clearCart();
      navigate('/pagamento');
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      observation: null,
      additionals: (extras[item.id] || []).map((e) => ({
        name: e.name, quantity: Number(e.quantity), unitPrice: Number(e.unitPrice),
      })),
    }));

    if (tipoVenda === 'comanda') {
      const customerName = detalhes.nome || detalhes.numero
        ? `${detalhes.nome} ${detalhes.numero}`.trim()
        : `Mesa ${comandas.length + 1}`;
      try {
        const res = await ordersApi.create({ customerName, type: 'LOCAL', observation: '', paymentMethod: null, items: orderItems });
        setComandas((prev) => [
          ...prev,
          {
            ...res,
            mesa: detalhes.numero || detalhes.nome || `Mesa ${comandas.length + 1}`,
            itens: (res.items ?? []).map((i) => ({ id: i.id, name: i.productName, quantity: i.quantity, price: Number(i.unitPrice), total: Number(i.total) })),
            total: Number(res.totalValue),
            data: new Date(res.createdAt).toLocaleString('pt-BR'),
          },
        ]);
        toast.success('Comanda registrada com sucesso');
      } catch (err) {
        const msg = err?.response?.data?.message;
        toast.error(msg ? `Estoque insuficiente: ${msg}` : 'Erro ao registrar comanda — salvo localmente');
        setComandas((prev) => [
          ...prev,
          { id: Date.now(), mesa: detalhes.numero || detalhes.nome || `Mesa ${comandas.length + 1}`, itens: items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })), total, data: new Date().toLocaleString('pt-BR') },
        ]);
      }
      setActiveTab('comandas');
      setDetalhes({ nome: '', numero: '' });
    } else if (tipoVenda === 'delivery') {
      const customerName = detalhes.nome || `Cliente ${deliveries.length + 1}`;
      try {
        const res = await ordersApi.create({
          customerName, type: 'DELIVERY', observation: '', paymentMethod: null, items: orderItems,
          address: { cep: endereco.cep || null, street: endereco.logradouro || null, number: endereco.numero || null, complement: endereco.complemento || null },
        });
        const enderecoFmt = [endereco.logradouro, endereco.numero, endereco.complemento].filter(Boolean).join(', ');
        setDeliveries((prev) => [
          ...prev,
          {
            ...res,
            nome: res.customerName,
            endereco: res.address?.street ?? enderecoFmt,
            itens: (res.items ?? []).map((i) => ({ id: i.id, name: i.productName, quantity: i.quantity, price: Number(i.unitPrice), total: Number(i.total) })),
            total: Number(res.totalValue),
            data: new Date(res.createdAt).toLocaleString('pt-BR'),
          },
        ]);
        toast.success('Delivery registrado com sucesso');
        setEndereco({ cep: '', logradouro: '', numero: '', complemento: '' });
      } catch (err) {
        const msg = err?.response?.data?.message;
        toast.error(msg ? `Estoque insuficiente: ${msg}` : 'Erro ao registrar delivery — salvo localmente');
        setDeliveries((prev) => [
          ...prev,
          { id: Date.now(), nome: customerName, endereco: endereco.logradouro || 'Endereço não informado', itens: items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, total: i.price * i.quantity })), total, data: new Date().toLocaleString('pt-BR') },
        ]);
      }
      setActiveTab('delivery');
      setDetalhes({ nome: '', numero: '' });
    }

    clearCart();
  }, [tipoVenda, items, extras, total, detalhes, endereco, comandas.length, deliveries.length, clearCart, navigate]);

  /* ── Cancel order ───────────────────────────────────────── */
  const handleCancelar = useCallback(async (id, type) => {
    const isLocal = typeof id === 'number';
    if (!isLocal) {
      try { await ordersApi.cancel(id); toast.success('Pedido cancelado.'); }
      catch (err) { toast.error(err.message ?? 'Erro ao cancelar.'); return; }
    }
    if (type === 'comanda') setComandas((prev) => prev.filter((c) => c.id !== id));
    else setDeliveries((prev) => prev.filter((d) => d.id !== id));
  }, []);

  /* ── Close account ──────────────────────────────────────── */
  const handleFecharConta = useCallback((order, type) => {
    localStorage.setItem('tipoVenda', type);
    localStorage.setItem('detalhesVenda', JSON.stringify({ nome: type === 'comanda' ? order.mesa : order.nome, numero: type === 'comanda' ? '' : order.endereco }));
    localStorage.setItem('totalVenda', order.total);
    localStorage.setItem('itensVenda', JSON.stringify(order.itens));
    navigate('/pagamento');
  }, [navigate]);

  /* ── Edit order ─────────────────────────────────────────── */
  const handleSaveEdit = useCallback((updated) => {
    if (editType === 'comanda') setComandas((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    else setDeliveries((prev) => prev.map((d) => d.id === updated.id ? updated : d));
    setEditTarget(null);
  }, [editType]);

  /* ── Extras ─────────────────────────────────────────────── */
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

      <div
        className="relative flex flex-col flex-1 overflow-hidden"
        style={{ marginTop: 'var(--navbar-height)', height: 'calc(100vh - var(--navbar-height))' }}
      >
        <MenuTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
        />

        {/* VENDAS TAB */}
        {activeTab === 'venda' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Products area */}
            <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: !isEmpty ? '1px solid var(--color-border)' : 'none' }}>
              <CategoryBar
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                productGridRef={productGridRef}
              />
              <ProductGrid
                ref={productGridRef}
                items={products}
                loading={isLoading}
                search={search}
                activeCategory={activeCategory}
                onAdd={(item) => addItem(item)}
              />
            </div>

            {/* Cart */}
            <CartPanel
              items={items}
              extras={extras}
              total={total}
              onIncrease={(id, qty) => updateQuantity(id, qty)}
              onDecrease={(id, qty) => updateQuantity(id, qty)}
              onRemove={(id) => updateQuantity(id, 0)}
              onEditExtras={(item) => setExtrasModal(item)}
              onClear={clearCart}
              onFinalize={handleFinalizarVenda}
              orderForm={orderForm}
              finalizeDisabled={isEmpty}
              deliveryMode={tipoVenda === 'delivery'}
            />
          </div>
        )}

        {/* COMANDAS TAB */}
        {activeTab === 'comandas' && (
          <div className="flex-1 overflow-y-auto p-4" style={{ background: 'var(--color-bg)' }}>
            {comandas.length === 0 ? (
              <EmptyState
                icon={INBOX_ICON}
                title="Nenhuma comanda"
                description="As comandas registradas aparecem aqui."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {comandas.map((c) => (
                  <OrderCard
                    key={c.id}
                    order={c}
                    type="comanda"
                    onPrint={() => { setPrintTarget(c); setPrintType('comanda'); }}
                    onEdit={() => { setEditTarget(c); setEditType('comanda'); }}
                    onFecharConta={() => handleFecharConta(c, 'comanda')}
                    onOcultar={() => setComandas((prev) => prev.filter((x) => x.id !== c.id))}
                    onCancelar={() => handleCancelar(c.id, 'comanda')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DELIVERY TAB */}
        {activeTab === 'delivery' && (
          <div className="flex-1 overflow-y-auto p-4" style={{ background: 'var(--color-bg)' }}>
            {deliveries.length === 0 ? (
              <EmptyState
                icon={INBOX_ICON}
                title="Nenhum delivery"
                description="Os pedidos de delivery aparecem aqui."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {deliveries.map((d) => (
                  <OrderCard
                    key={d.id}
                    order={d}
                    type="delivery"
                    onPrint={() => { setPrintTarget(d); setPrintType('delivery'); }}
                    onEdit={() => { setEditTarget(d); setEditType('delivery'); }}
                    onFecharConta={() => handleFecharConta(d, 'delivery')}
                    onOcultar={() => setDeliveries((prev) => prev.filter((x) => x.id !== d.id))}
                    onCancelar={() => handleCancelar(d.id, 'delivery')}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extras modal */}
      {extrasModal && (
        <ExtrasModal
          cartItem={extrasModal}
          initialExtras={extras[extrasModal.id] || []}
          onSave={handleSaveExtras}
          onClose={() => setExtrasModal(null)}
        />
      )}

      {/* Print modal */}
      <PrintModal
        open={!!printTarget}
        order={printTarget}
        operator={operator}
        onClose={() => { setPrintTarget(null); setPrintType(null); }}
      />

      {/* Edit modal */}
      {editTarget && (
        <EditOrderModal
          open
          order={editTarget}
          type={editType}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
