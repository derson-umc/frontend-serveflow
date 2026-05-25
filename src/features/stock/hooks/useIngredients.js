import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';
import { insumoSchema } from '../constants';

const CREATE_DEFAULTS = { name: '', unit: 'kg', category: '', currentQuantity: '', minimumQuantity: '', supplier: '', averageCost: '' };
const EDIT_DEFAULTS   = { name: '', unit: 'kg', category: '', minimumQuantity: '', supplier: '', averageCost: '' };

export function useIngredients({ items, onRefresh }) {
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalCreate, setModalCreate]   = useState(false);
  const [modalEdit, setModalEdit]       = useState(null);
  const [action, setAction]             = useState(null); // { type: 'entry'|'loss'|'adjust', item }
  const [toggling, setToggling]         = useState(null);

  const handleInventoryAction = useCallback((type, item) => setAction({ type, item }), []);
  const closeAction            = useCallback(() => setAction(null), []);

  const createForm = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: CREATE_DEFAULTS,
  });

  const editForm = useForm({
    resolver: zodResolver(insumoSchema.omit({ currentQuantity: true })),
    defaultValues: EDIT_DEFAULTS,
  });

  const openCreate = () => {
    createForm.reset(CREATE_DEFAULTS);
    setModalCreate(true);
  };

  const openEdit = (item) => {
    editForm.reset({
      name:            item.name,
      unit:            item.unit,
      category:        item.category || '',
      minimumQuantity: item.minimumQuantity,
      supplier:        item.supplier || '',
      averageCost:     item.averageCost ?? '',
    });
    setModalEdit(item);
  };

  const onCreateSubmit = async (data) => {
    try {
      await stockApi.items.create({
        name:            data.name.trim(),
        unit:            data.unit,
        currentQuantity: data.currentQuantity ?? 0,
        minimumQuantity: data.minimumQuantity,
        category:        data.category || null,
        supplier:        data.supplier || null,
        averageCost:     data.averageCost !== '' ? Number(data.averageCost) : null,
      });
      toast.success(`Insumo "${data.name.trim()}" cadastrado!`);
      setModalCreate(false);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao cadastrar insumo.');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await stockApi.items.update(modalEdit.id, {
        name:            data.name.trim(),
        unit:            data.unit,
        currentQuantity: Number(modalEdit.currentQuantity),
        minimumQuantity: data.minimumQuantity,
        category:        data.category || null,
        supplier:        data.supplier || null,
        averageCost:     data.averageCost !== '' ? Number(data.averageCost) : null,
      });
      toast.success('Insumo atualizado!');
      setModalEdit(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao atualizar.');
    }
  };

  const handleToggle = async (item) => {
    setToggling(item.id);
    try {
      await stockApi.items.toggleStatus(item.id);
      toast.success(item.status === 'ACTIVE' ? 'Insumo desativado.' : 'Insumo reativado.');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao alterar status.');
    } finally {
      setToggling(null);
    }
  };

  const filtered = items.filter((i) => {
    const matchSearch = !search
      || i.name.toLowerCase().includes(search.toLowerCase())
      || (i.category || '').toLowerCase().includes(search.toLowerCase())
      || (i.supplier || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return {
    search, setSearch,
    filterStatus, setFilterStatus,
    modalCreate, setModalCreate, openCreate,
    modalEdit, setModalEdit, openEdit,
    action, handleInventoryAction, closeAction,
    toggling,
    createForm, editForm,
    onCreateSubmit, onEditSubmit,
    handleToggle,
    filtered,
  };
}
