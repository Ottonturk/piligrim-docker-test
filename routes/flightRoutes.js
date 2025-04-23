const express = require('express');
//import express from 'express';
const router = express.Router();
const flightController = require('../controllers/flightController');
const fs = require('fs');
const path = require('path');
const amadeusAuthService = require('../services/amadeusAuthService'); // Импортируем сервис авторизации


// Функция для записи логов в файл
const logToFile = (message) => {
    const logFilePath = path.join(__dirname, 'flightRoutes_logs.txt');
    const timeStamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `${timeStamp} - ${message}\n`, 'utf8');
};

// Логируем каждый запрос к маршруту
//router.use((req, res, next) => {
 //   console.log(`Request Method: ${req.method}, Request URL: ${req.originalUrl}`); // Логируем метод и URL
 //   console.log(`Response data: ${res.query}`); // Логируем метод kmdtmf
    
   // next(); // Продолжаем выполнение
//});

//router.get('/search', flightController.searchFlights);
// Маршрут для поиска рейсов
////router.get('/search', (req, res) => {
/////router.get('/results', (req, res) => {
//router.get('/results', (req, res) => {
router.get('/results', async (req, res) => {
    try {


        logToFile('GET /search called with params: ' + JSON.stringify(req.query || {}));
        console.log('Received params in route:', req.query);  // Добавляем логирование в консоль для проверки


        // Получаем актуальный токен
        const accessToken = await amadeusAuthService.getAccessToken();

        // Добавляем токен в запрос
        req.accessToken = accessToken;
    
        logToFile('GET /search returned with params: ' + JSON.stringify(res.data || {}));
        console.log('Received params in route:', res.data);  // Добавляем логирование в консоль для проверки
        logToFile('GET /results using accessToken: ' + accessToken);

        flightController.searchFlights(req, res);
    } catch (error) {
        logToFile('Error in GET /results: ' + error.message);
        console.error('Error in GET /results route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }    

});


//router.post('/search-flights', flightController.searchFlights); 
//router.post('/search-flights', (req, res) => {
router.post('/search-flights', async (req, res) => {
    try {
        logToFile('POST /search-flights called with body: ' + JSON.stringify(req.query || {}));
        console.log('Received params in route:', req.query);  // Добавляем логирование в консоль для проверки
    
        logToFile('GET /search-flights returned with params: ' + JSON.stringify(res.data || {}));
        console.log('Received params in route:', res.data);  // Добавляем логирование в консоль для проверки

        // Получаем актуальный токен
         const accessToken = await amadeusAuthService.getAccessToken();

         // Добавляем токен в запрос
         req.accessToken = accessToken;
 
         logToFile('POST /search-flights using accessToken: ' + accessToken);
        

    
        flightController.searchFlights(req, res);
    } catch (error) {
        logToFile('Error in POST /search-flights: ' + error.message);
        console.error('Error in POST /search-flights route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для подтверждения цены
router.post('/confirm-price', async (req, res) => {
    try {
        logToFile('POST /confirm-price called with body: ' + JSON.stringify(req.body || {}));
        console.log('Received body in /confirm-price:', req.body);  // Логирование запроса

        // Получаем актуальный токен
        const accessToken = await amadeusAuthService.getAccessToken();

        // Добавляем токен в запрос
        req.accessToken = accessToken;

        logToFile('POST /confirm-price using accessToken: ' + accessToken);

        // Вызов контроллера
        flightController.confirmFlightPrice(req, res);
    } catch (error) {
        logToFile('Error in POST /confirm-price: ' + error.message);
        console.error('Error in POST /confirm-price route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}); 

// Маршрут для создания заказа
router.post('/create-order', async (req, res) => {
    try {
        logToFile('POST /create-order called with body: ' + JSON.stringify(req.body || {}));
        console.log('Received body in /create-order:', req.body);

        // Получаем актуальный токен
        const accessToken = await amadeusAuthService.getAccessToken();

        // Добавляем токен в запрос
        req.accessToken = accessToken;

        logToFile('POST /create-order using accessToken: ' + accessToken);

        // Вызов контроллера для создания заказа
        //flightController.createFlightOrder(req, res);
        flightController.createOrder(req, res);  // Исправляем название на createOrder

    } catch (error) {
        logToFile('Error in POST /create-order: ' + error.message);
        console.error('Error in POST /create-order route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
