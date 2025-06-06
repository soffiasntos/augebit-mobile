import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Atualizar notificações baseado nos produtos com baixo estoque
  useEffect(() => {
    setHasNotifications(produtosBaixoEstoque.length > 0);
  }, [produtosBaixoEstoque]);

  const updateProdutosBaixoEstoque = (produtos) => {
    // Filtrar produtos com baixo estoque (quantidade <= mínimo)
    const produtosBaixo = produtos.filter(produto => 
      produto.quantidade <= produto.minimo
    );
    setProdutosBaixoEstoque(produtosBaixo);
  };

  const clearNotifications = () => {
    setHasNotifications(false);
  };

  const value = {
    produtosBaixoEstoque,
    hasNotifications,
    updateProdutosBaixoEstoque,
    clearNotifications,
    notificationCount: produtosBaixoEstoque.length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};