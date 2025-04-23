// OrderContext.js
import React, { createContext, useState, useContext } from 'react';

// Создаем контекст
const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orderDetails, setOrderDetails] = useState(null);

    return (
        <OrderContext.Provider value={{ orderDetails, setOrderDetails }}>
            {children}
        </OrderContext.Provider>
    );
};

// Хук для удобного доступа к контексту
export const useOrder = () => useContext(OrderContext);
