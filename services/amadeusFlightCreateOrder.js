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
        new winston.transports.File({ filename: 'amadeusFlightCreateOrder_logs.txt' })
    ]
});

const amadeusCreateOrderUrl = 'https://test.api.amadeus.com/v1/booking/flight-orders';

// Функция для проверки, достиг ли путешественник 18 лет
const isAdult = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear = (today.getMonth() > birthDate.getMonth()) ||
                                   (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    return hasHadBirthdayThisYear ? age >= 18 : age > 18;
};



const createFlightOrder = async ({ flightOffers, travelers }) => {
    try {
        const accessToken = await amadeusAuthService.getAccessToken();

        // Преобразуем данные путешественников
        const travelersData = travelers.map((traveler, index) => {
            // Проверка, что номер телефона существует
            //const phone = traveler.phone || '';
            const phone = traveler.phone || '0000000000';  // Дефолтный номер телефона
            ////const countryCallingCode = phone ? phone.slice(0, 2) : '1';  // Если нет телефона, берем дефолтный код страны
            const countryCallingCode = traveler.phone ? traveler.phone.slice(0, 2) : '7';  // Код страны по умолчанию (Россия)
            //const phoneNumber = phone ? phone.slice(2) : '0000000000';   // Дефолтный номер телефона
            const phoneNumber = phone ? phone.slice(2) :  '0000000000'; 
            // Функция для очистки имени и фамилии от недопустимых символов

          //  const cleanInput = (input) => {
            //    return input.replace(/[^a-zA-Z]/g, '').trim();  // Убираем все, кроме букв, и удаляем пробелы
            //};

            return {
                id: `${index + 1}`,
                dateOfBirth: traveler.dateOfBirth,
                name: {
                    ////firstName: traveler.firstName,
                    ////lastName: traveler.lastName
                    firstName: traveler.firstName || 'TEST',  // Дефолтное значение для обязательного поля
                    lastName: traveler.lastName || 'TESTOV'     // Дефолтное значение для обязательного поля
                   /// firstName: cleanInput(traveler.firstName) || 'N/A',  // Очищаем и проверяем firstName
                   /// lastName: cleanInput(traveler.lastName) || 'N/A'     // Очищаем и проверяем lastName
                },
                ////gender: traveler.gender || 'MALE', // Используем переданное значение или дефолтное
                gender: traveler.gender || 'MALE', // Используем переданное значение или дефолтное
                contact: {
                    emailAddress: traveler.email || 'default@example.com', // Дефолтный email,
                    phones: [
                        {
                            deviceType: 'MOBILE',
                            countryCallingCode: countryCallingCode,
                            number: phoneNumber
                        }
                    ]
                },
                //documents: traveler.dateOfBirth < '2006-01-01' ? [ // Если старше 18, добавляем паспортные данные
                documents: isAdult(traveler.dateOfBirth) ? [
                    {
                        documentType: 'PASSPORT',
                        number: '123456789',  // Пример номера паспорта
                        expiryDate: '2025-12-31',  // Пример даты истечения паспорта
                        issuanceCountry: 'US',
                        nationality: 'US',
                        birthPlace: 'New York',
                        issuanceDate: '2015-01-01',
                        
                        holder: true // Указываем владельца документа
                    }
                ] : []
            };
        });

        // Статичные блоки
        const orderPayload = {
            data: {
                type: 'flight-order',
                flightOffers: flightOffers,
                travelers: travelersData,
                remarks: {
                    general: [
                        { subType: 'GENERAL_MISCELLANEOUS', text: 'Passenger booking remark' }
                    ]
                },
                ticketingAgreement: {
                    option: 'DELAY_TO_CANCEL',
                    delay: '6D'
                },
                contacts: [
                    {
                        addresseeName: { firstName: 'John', lastName: 'Doe' },
                        companyName: 'Amadeus TR',
                        purpose: 'STANDARD',
                        phones: [
                            {
                                deviceType: 'MOBILE',
                                countryCallingCode: '1',
                                number: '9991234567'
                            }
                        ],
                        emailAddress: 'support@example.com',
                        address: {
                            lines: ['123 Example Street'],  // Статичный адрес
                            postalCode: '12345',
                            cityName: 'Moscow',
                            countryCode: 'RU'
                        }
                    }
                ]
            }
        };

        // Логируем параметры запроса перед отправкой
        logger.info('Sending flight order creation request', { flightOffers, travelersData, orderPayload });

        // Отправляем POST запрос
        const response = await axios.post(
            amadeusCreateOrderUrl,
            orderPayload,
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

        const orderResponse = response.data;
        logger.info(`Order created successfully: ${JSON.stringify(orderResponse)}`);
        return orderResponse;

    } catch (error) {
        logger.error(`Error creating order: ${error.message}`);
        throw error;
    }
};

module.exports = {
    createFlightOrder
};
