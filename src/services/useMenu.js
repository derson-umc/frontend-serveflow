import { useState, useCallback } from 'react';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(async (requestFn, successMessage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestFn();
      if (successMessage) alert(successMessage);
      return result;
    } catch (err) {
      setError(err.message);
      alert(`Erro: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMenu = useCallback((menuData) => 
    handleRequest(() => menuService.createMenu(menuData), 'Menu criado com sucesso!'), 
    [handleRequest]
  );

  const getAllMenus = useCallback(() => 
    handleRequest(() => menuService.getAllMenus()), 
    [handleRequest]
  );

  const getMenuById = useCallback((id) => 
    handleRequest(() => menuService.getMenuById(id)), 
    [handleRequest]
  );

  const placeOrder = useCallback((menuId, orderData) => 
    handleRequest(() => menuService.placeOrder(menuId, orderData), 'Pedido realizado!'), 
    [handleRequest]
  );

  const unlockMenu = useCallback((id) => 
    handleRequest(() => menuService.unlockMenu(id), 'Menu desbloqueado!'), 
    [handleRequest]
  );

  const updateItemAvailability = useCallback((menuId, menuItemId, available) => 
    handleRequest(() => menuService.updateItemAvailability(menuId, menuItemId, available)), 
    [handleRequest]
  );

  const removeMenuItem = useCallback((menuId, menuItemId, reason) => 
    handleRequest(() => menuService.removeMenuItem(menuId, menuItemId, reason), 'Item removido!'), 
    [handleRequest]
  );

  return {
    loading,
    error,
    createMenu,
    getAllMenus,
    getMenuById,
    placeOrder,
    unlockMenu,
    updateItemAvailability,
    removeMenuItem,
  };
};