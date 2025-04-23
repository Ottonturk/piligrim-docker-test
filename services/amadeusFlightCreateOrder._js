const axios = require('axios');
const config = require('config');
const amadeusAuthService = require('./amadeusAuthService');  // Используем тот же сервис авторизации
const winston = require('winston');

// Логгер
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'amadeusFlightCreateOrder_logs.txt' })
    ]
});

const amadeusCreateOrderUrl = 'https://test.api.amadeus.com/v1/booking/flight-orders';  // URL для создания заказа

// Функция для создания заказа
const createFlightOrder = async (orderData) => {
    try {
        // Получаем токен через сервис авторизации
        const accessToken = await amadeusAuthService.getAccessToken();

        // Логируем параметры запроса перед отправкой
        logger.info('Sending flight order creation request', { orderData });

        // Отправляем POST запрос в Amadeus API
        const response = await axios.post(
            amadeusCreateOrderUrl,
            { data: orderData },  // Передаем данные заказа
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,  // Bearer токен для авторизации
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'YourApp/1.0',
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
        );

        // Логируем успешное создание заказа
        logger.info(`Order created successfully: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        // Логируем ошибки
        logger.error(`Error creating order: ${error.message}`);
        throw error;
    }
};

module.exports = {
    createFlightOrder
};
