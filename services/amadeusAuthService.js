const axios = require('axios');
const config = require('config');

const amadeusConfig = config.get('amadeus');
let accessToken = null;
let tokenExpiryTime = null;

// Функция для получения нового токена
const fetchAccessToken = async () => {
    try {
        const response = await axios.post(amadeusConfig.token_url, 
            `grant_type=client_credentials&client_id=${amadeusConfig.client_id}&client_secret=${amadeusConfig.client_secret}`, 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, expires_in, state } = response.data;

        // Проверяем статус токена
        if (state !== 'approved') {
            throw new Error('Token request not approved');
        }

        // Обновляем значения токена и времени истечения
        accessToken = access_token;
        tokenExpiryTime = Date.now() + expires_in * 1000; // Время жизни токена

        console.log('New access token fetched:', accessToken);

        // Возвращаем токен
        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw new Error('Failed to fetch access token');
    }
};

// Функция для получения токена, обновления если истек
const getAccessToken = async () => {
    if (!accessToken || Date.now() >= tokenExpiryTime) {
        console.log('Token expired or not available. Fetching new one...');
        return await fetchAccessToken();
    }
    return accessToken;
};

// Инициализация авторизации при старте сервера
const initAmadeusAuth = async () => {
    try {
        await fetchAccessToken(); // Получаем токен при старте сервера

        // Обновляем токен перед истечением (например, за 5 минут до истечения)
        const refreshInterval = tokenExpiryTime - Date.now() - 5 * 60 * 1000;

        // Устанавливаем таймер для автоматического обновления токена
        setTimeout(async () => {
            await fetchAccessToken();
        }, refreshInterval);

    } catch (error) {
        console.error('Failed to initialize Amadeus authentication:', error);
    }
};

module.exports = {
    getAccessToken,
    initAmadeusAuth
};
