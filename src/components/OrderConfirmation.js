import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../OrderContext';
import log from 'loglevel';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    //const { orderDetails } = useOrder();

    const { orderDetails } = useOrder();

    useEffect(() => {
        if (!orderDetails) {
            alert('Нет данных о заказе. Пожалуйста, выполните заказ снова.');
            navigate('/'); // возвращаем на главную, если данных нет
        }
    }, [orderDetails, navigate]);

    if (!orderDetails) return null;

    log.info('Order Details:', orderDetails);

    const orderId = orderDetails.associatedRecords?.[0]?.id || 'Не указано';
    const creationDate = orderDetails.associatedRecords?.[0]?.creationDate
        ? new Date(orderDetails.associatedRecords[0].creationDate).toLocaleDateString()
        : 'Не указано';
    const orderStatus = orderDetails.status || 'Не указано';
    


    return (
        <div className="order-confirmation-container">
            <h1>Заказ успешно создан!</h1>
            <div className="order-details">
                <p>Номер заказа: {orderId}</p>
                <p>Дата: {creationDate}</p>
                <p>Статус: {orderStatus}</p>
             
                
            </div>
            <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
    );
};

export default OrderConfirmation;
