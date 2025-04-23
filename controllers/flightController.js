const AmadeusService = require('../services/amadeusService');
const amadeusFlightOfferPriceService = require('../services/amadeusFlightOfferPrice');
const amadeusFlightCreateOrder = require('../services/amadeusFlightCreateOrder');


const Response = require('../models/response');
const SearchQuery = require('../models/requests'); // Модель для сохранения запросов в MongoDB
const fs = require('fs');
const path = require('path');


// Функция для записи логов в файл
const logToFile = (message) => {
    const logFilePath = path.join(__dirname, 'flightController_logs.txt');
    const timeStamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `${timeStamp} - ${message}\n`, 'utf8');
};

// Функция для сохранения поискового запроса в MongoDB
const saveSearchQuery = async (searchData) => {
    const searchQuery = new SearchQuery(searchData); // Создаем новую запись с данными запроса
    await searchQuery.save(); // Сохраняем запрос в базу данных
};


const searchFlights = async (req, res) => {
    try {
        const params = req.query;
        console.log('searchFlights called with params:', params); // Логируем параметры запроса
        logToFile(`Search request received with params: ${JSON.stringify(params)}`);

            
        const response = await AmadeusService.searchFlights(params);
        logToFile(`Received response from AmadeusService: ${JSON.stringify(response.data)}`);
        // Логируем ответ от сервиса
        console.log('Response from AmadeusService:', response.data);


        // Сохраняем запрос в базу данных MongoDB
        await saveSearchQuery(params);

        // Сохранение успешного ответа в MongoDB
        const newResponse = new Response({
            request: JSON.stringify(params),
            response: response.data,
            statusCode: response.status
        });
        await newResponse.save();
        logToFile('Response saved to MongoDB');
        console.log('Response saved to MongoDB');  // Логируем процесс сохранения

       // logToFile(`Error occurred: ${error.message}`);

        console.log('Saved response to MongoDB:', newResponse); // Логируем сохраненный объект

        //console.log('Response from AmadeusService:', response.data); // Логируем ответ API
        console.log('Full Response from AmadeusService:', response); // Логируем ответ API
        //logToFile(`Received response from AmadeusService: ${JSON.stringify(res.data)}`);
        
         // Отправляем ответ клиенту:
        //res.status(response.status).json(response.data);

        logToFile(`sending response to  Client: ${JSON.stringify(response.data)}`);
        res.status(200).json(response.data);
        
    } catch (error) {
        
        logToFile(`Error occurred: ${error.message}`);

        // Сохранение ошибки в MongoDB
        const errorResponse = new Response({
            request: JSON.stringify(req.query),
            response: error.response ? error.response.data : error.message,
            statusCode: error.response ? error.response.status : 500
        });
        await errorResponse.save();
        logToFile('Error response saved to MongoDB');

        res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : error.message);
    }
};


//const amadeusFlightOfferPriceService = require('../services/amadeusFlightOfferPrice');

const confirmFlightPrice = async (req, res) => {
    try {
        const flightOffer = req.body.flightOffer; // Извлекаем предложение из запроса клиента
        // Проверка, что flightOffer есть в запросе
        if (!flightOffer) {
            logToFile('Missing flightOffer in request body');
            return res.status(400).json({ error: 'flightOffer is required in request body' });
        }
        logToFile(`Confirming flight price for offer: ${JSON.stringify(flightOffer)}`);




        const confirmedPrice = await amadeusFlightOfferPriceService.getFlightOfferPrice(flightOffer);
        
        res.status(200).json(confirmedPrice);
    } catch (error) {
        logToFile(`Error confirming flight price: ${error.message}`);
        console.error('Error confirming flight price:', error.message);
        res.status(500).json({ error: 'Failed to confirm flight price' });
    }
};


//const createOrder = async (req, res) => {
  //  try {
    //    const orderData = req.body.orderData;
      //  const response = await amadeusFlightCreateOrder.createFlightOrder(orderData);
        //res.status(200).json(response);
    //} catch (error) {
      //  res.status(500).json({ error: 'Ошибка при создании заказа' });
   // }
//};

const createOrder = async (req, res) => {
    try {
        const { flightOffers, travelers } = req.body; // Извлекаем предложения и пассажиров из запроса
        // Логирование для отладки
        logToFile(`Received flightOffers: ${JSON.stringify(flightOffers)}`);
        logToFile(`Received travelers: ${JSON.stringify(travelers)}`);
        // Проверяем, что данные корректны
        if (!flightOffers || !travelers) {
            logToFile('Missing flightOffers or travelers in request body');
            return res.status(400).json({ error: 'flightOffers and travelers are required in request body' });
        }

        ///logToFile(`Creating order for flightOffers: ${JSON.stringify(flightOffers)}, travelers: ${JSON.stringify(travelers)}`);

        // Вызываем сервис для создания заказа
       /// const orderResponse = await amadeusFlightCreateOrder.createFlightOrder({ flightOffers, travelers });
        // Передача данных для создания заказа в Amadeus API
        const orderData = {
            type: "flight-order",
            flightOffers: flightOffers,
            travelers: travelers.map((traveler, index) => ({
                id: `${index + 1}`,
                dateOfBirth: traveler.dateOfBirth,
                name: {
                    firstName: traveler.firstName,
                    lastName: traveler.lastName
                },
                contact: {
                    emailAddress: traveler.email,
                    phones: [{ deviceType: "MOBILE", number: traveler.phone }]
                },
                //gender: "MALE",  // В реальности, этот параметр нужно собирать у пользователя
                gender: traveler.gender || 'MALE',  // Проверяем гендер
                //travelerType: "ADULT"
                travelerType: traveler.dateOfBirth && new Date().getFullYear() - new Date(traveler.dateOfBirth).getFullYear() >= 18 ? 'ADULT' : 'CHILD'
            }))
        };
        // Вызов сервиса для создания заказа
        const orderResponse = await amadeusFlightCreateOrder.createFlightOrder(orderData);
        logToFile('Order created successfully');

        res.status(200).json(orderResponse);
    } catch (error) {
        logToFile(`Error creating flight order: ${error.message}`);
        console.error('Error creating flight order:', error.message);

        // Проверка, есть ли ошибка от API Amadeus
        if (error.response && error.response.status) {
            logToFile(`Amadeus API error: ${JSON.stringify(error.response.data)}`);
            return res.status(error.response.status).json(error.response.data); // Возвращаем ошибку Amadeus клиенту
       }
        res.status(500).json({ error: 'Failed to create flight order' });
    }
};



//module.exports = {
  //  confirmFlightPrice
//};


module.exports = {
    searchFlights,
    confirmFlightPrice,
    createOrder
};
