const axios = require('axios');
const config = require('config');
//import axios from 'axios';
//import config from 'config';
const winston = require('winston');
const amadeusAuthService = require('./amadeusAuthService'); // Подключение сервиса авторизации


// Настраиваем логгер
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


const amadeusApiUrl = config.get('amadeus.apiUrl');
//const amadeusApiKey = process.env.AMADEUS_API_KEY.trim().toString() ;
////const amadeusApiKey = config.get('amadeus.apiKey');
const ensureHttps = (url) => url.startsWith('https') ? url : url.replace(/^http:/, 'https:');

const secureAmadeusApiUrl = ensureHttps(amadeusApiUrl);

const searchFlights = async (params) => {
    try {
        //

        // Получаем актуальный токен через сервис авторизации
        const accessToken = await amadeusAuthService.getAccessToken();
        // Логируем параметры и токен перед отправкой запроса
        console.log('Request URL:', amadeusApiUrl);
        console.log('Request Headers:', {
            //'Authorization': `Bearer ${amadeusApiKey.trim().toString()}`, // Bearer токен
            'Authorization': `Bearer ${accessToken.trim().toString()}`, // Динамический токен
            'Cache-Control': 'no-cache',
            'User-Agent': 'YourApp/1.0',
            'Accept': '*/*',
            'Content-Type': 'application/json'
        });
        console.log('Request Params:', params);
        //
        

       // const response = await axios.get(amadeusApiUrl, {
        const response = await axios.get(secureAmadeusApiUrl, {
            params,
            headers: {
                //'Authorization': `Bearer ${amadeusApiKey.trim().toString()}`,
                'Authorization': `Bearer ${accessToken.trim().toString()}`, // Динамический токен
                'Cache-Control': 'no-cache',
                'User-Agent': 'YourApp/1.0',
                'Accept': '*/*',
                'Content-Type': 'application/json'
            }
        });
        console.log('Response from AmadeusService:', response.data);
        logger.info(`Response from AmadeusService: ${JSON.stringify(response.data)}`);

        return response;
        
    } catch (error) {            
        // Логируем ошибку
        console.error('Error in AmadeusService:', error.message);


        //// Если сервер вернул ответ с ошибкой, логируем его данные
        if (error.response) {
            console.error('Error details:', error.response.data);
            logger.error(`Amadeus API error response: ${JSON.stringify(error.response.data)}`);
        }



        throw error;
        
    }

     
};

// Интерцептор для логирования всех запросов
axios.interceptors.request.use((config) => {
    console.log('Sending Request with Headers:', config.headers);
    return config;
});


module.exports = {
    searchFlights
};

//export default {
  //  searchFlights
//};
//console.log('Request Headers:', {
  //  Authorization: `Bearer ${accessToken.trim().toString()}` // Bearer токен
//});