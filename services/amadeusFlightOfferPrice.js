const axios = require('axios');
const config = require('config');
const amadeusAuthService = require('./amadeusAuthService');
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
        new winston.transports.File({ filename: 'logs.txt' })
    ]
});

const amadeusPricingUrl = 'https://test.api.amadeus.com/v1/shopping/flight-offers/pricing?forceClass=false';

const getFlightOfferPrice = async (flightOffer) => {
    try {
        // Получаем токен авторизации
        const accessToken = await amadeusAuthService.getAccessToken();

        // Отправляем POST-запрос на API Amadeus
        const response = await axios.post(
            amadeusPricingUrl,
            {
                data: {
                    type: "flight-offers-pricing",
                    flightOffers: [flightOffer]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'YourApp/1.0',
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
        );

        // Логируем ответ от API
        logger.info(`Received response from Amadeus for pricing: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        logger.error(`Error in getFlightOfferPrice: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getFlightOfferPrice
};
