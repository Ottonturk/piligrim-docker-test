import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import log from 'loglevel';
import { useOrder } from '../OrderContext';
import './FlightPriceConfirmation.css'; // Подключаем стили

log.setLevel('info');

const FlightPriceConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setOrderDetails } = useOrder();

    // Локальное состояние для хранения данных пассажиров
    const [travelers, setTravelers] = useState([
        { firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '', gender: 'MALE' }
    ]);

    // Функция для очистки имени и фамилии
    const cleanNameInput = (input) => {
        return input.replace(/[^a-zA-Z\s']/g, '').trim();  // Разрешаем буквы, пробелы и апострофы
    };

    // Обработчик изменений в полях пассажиров
    const handleTravelerChange = (index, field, value) => {
        setTravelers(prevTravelers => {
            const updatedTravelers = [...prevTravelers];
            if (field === 'firstName' || field === 'lastName') {
                updatedTravelers[index][field] = cleanNameInput(value);
            } else {
                updatedTravelers[index][field] = value; // Для остальных полей сохраняем введенное значение без изменений
            }
            return updatedTravelers;
        });
    };

    // Обработчик добавления нового пассажира
    const handleAddTraveler = () => {
        setTravelers(prevTravelers => [
            ...prevTravelers,
            { firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '', gender: 'MALE' }
        ]);
    };

    // Валидация данных пассажиров перед отправкой
    const validateTravelers = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Простой паттерн для валидации email
        const phonePattern = /^\d{10}$/; // Простой паттерн для номера телефона (10 цифр)

        for (const traveler of travelers) {
            if (!traveler.firstName || !traveler.lastName || !traveler.dateOfBirth || !traveler.email || !traveler.phone) {
                alert("Все поля пассажиров должны быть заполнены.");
                return false;
            }
            if (!emailPattern.test(traveler.email)) {
                alert("Некорректный email.");
                return false;
            }
            if (!phonePattern.test(traveler.phone.replace(/\D/g, ''))) {
                alert("Некорректный номер телефона.");
                return false;
            }
        }
        return true;
    };

    // Обработчик отправки данных на создание заказа
    const handleCreateOrder = async () => {
        if (!validateTravelers()) return;

        const confirmedPrice = location.state?.confirmedPrice;

        if (!confirmedPrice) {
            log.error("Нет данных о подтвержденной цене.");
            alert("Нет данных о подтвержденной цене.");
            return;
        }

        const flightOffers = confirmedPrice.data?.flightOffers;

        if (!flightOffers || flightOffers.length === 0) {
            log.error("Нет предложений для создания заказа.");
            alert("Нет предложений для создания заказа.");
            return;
        }

        // Формирование данных путешественников
        const formattedTravelers = travelers.map((traveler, index) => ({
            id: `${index + 1}`,
            dateOfBirth: traveler.dateOfBirth,
            name: {
                firstName: traveler.firstName || 'TESTER',
                lastName: traveler.lastName || 'COMPONENT'
            },
            gender: traveler.gender,
            contact: {
                emailAddress: traveler.email,
                phones: [{
                    deviceType: "MOBILE",
                    countryCallingCode: traveler.phone.startsWith('7') ? "7" : "1", // Определение кода страны
                    number: traveler.phone.replace(/\D/g, '').slice(-10) // Извлечение последних 10 цифр номера телефона
                }],
                address: {
                    lines: ["123 Example Street"],  // Статичный адрес
                    postalCode: "12345",            // Пример почтового индекса
                    cityName: "Moscow",             // Пример города
                    countryCode: "RU"               // Код страны
                }
            },
            documents: [{
                documentType: 'PASSPORT',
                number: '123456789', // Пример номера паспорта
                expiryDate: '2030-12-31', // Статичная дата истечения паспорта
                issuanceCountry: 'RU', // Страна выдачи паспорта
                nationality: 'RU', // Гражданство
                birthPlace: 'Москва', // Место рождения
                issuanceDate: '2020-01-01', // Дата выдачи паспорта
                holder: true  // Указание владельца документа
            }]
        }));

        try {
            log.info("Sending order data:", { flightOffers, travelers: formattedTravelers });

            const response = await axios.post('/api/flights/create-order', {
                flightOffers: flightOffers,
                travelers: formattedTravelers
            });

            log.info("Order creation response:", response.data);
            setOrderDetails(response.data); // сохраняем данные о заказе
            // Перенаправляем пользователя на страницу подтверждения заказа
            navigate('/order-confirmation', { state: { orderDetails: response.data } });
        } catch (error) {
            log.error("Error creating flight order:", error);
            alert("Ошибка при создании заказа. Попробуйте снова.");
        }
    };

    // Проверяем, есть ли данные о подтвержденной цене
    const confirmedPrice = location.state?.confirmedPrice;
    log.info("Confirmed Price:", confirmedPrice);

    if (!confirmedPrice) {
        return <div>Нет данных о подтвержденной цене.</div>;
    }

    // Проверяем, есть ли flightOffers и содержит ли массив хотя бы один элемент
    const flightOffers = confirmedPrice.data?.flightOffers;
    if (!flightOffers || flightOffers.length === 0) {
        return <div>Не удалось получить информацию о предложении.</div>;
    }

    return (
        <div className="price-confirmation-container">
            <h1>Подтверждение цены</h1>

            {/* Отображаем информацию для каждого flightOffer */}
            {flightOffers.map((offer, offerIndex) => {
                const priceTotal = offer.price?.total || "Не указано";
                const priceCurrency = offer.price?.currency || "Не указано";
                const bookingId = offer.id || "Не указано";
                const availableSeats = offer.numberOfBookableSeats || "Не указано";

                return (
                    <div key={offerIndex} className="offer-details">
                        <h2>Предложение {offerIndex + 1}</h2>
                        <p>Цена: {priceTotal} {priceCurrency}</p>
                        <p>Номер брони: {bookingId}</p>
                        <p>Остаток доступных мест: {availableSeats}</p>

                        {/* Проходим по сегментам каждого flightOffer */}
                        {offer.itineraries?.map((itinerary, itineraryIndex) => (
                            <div key={itineraryIndex} className="itinerary-details">
                                <h3>Маршрут {itineraryIndex + 1}</h3>

                                {itinerary.segments?.map((segment, segmentIndex) => {
                                    const flightDestination = segment.aircraft?.code || 'Не указано';
                                    const departureTime = segment.departure?.at || 'Не указано';
                                    const departureAirport = segment.departure?.iataCode || 'Не указано';
                                    const departureTerminal = segment.departure?.terminal || 'Не указано';

                                    const arrivalTime = segment.arrival?.at || 'Не указано';
                                    const arrivalAirport = segment.arrival?.iataCode || 'Не указано';
                                    const arrivalTerminal = segment.arrival?.terminal || 'Не указано';

                                    return (
                                        <div key={segmentIndex} className="segment-details">
                                            <h4>Сегмент {segmentIndex + 1}</h4>
                                            <p>Код А/К: {flightDestination}</p>
                                            <p>Отправление: {departureTime} (Аэропорт: {departureAirport}, Терминал: {departureTerminal})</p>
                                            <p>Прибытие: {arrivalTime} (Аэропорт: {arrivalAirport}, Терминал: {arrivalTerminal})</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* Форма для ввода данных пассажиров */}
            <h2>Информация о пассажирах</h2>
            {travelers.map((traveler, index) => (
                <div key={index} className="traveler-form">
                    <h3>Пассажир {index + 1}</h3>
                    <input
                        type="text"
                        placeholder="Имя"
                        value={traveler.firstName}
                        onChange={(e) => handleTravelerChange(index, 'firstName', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Фамилия"
                        value={traveler.lastName}
                        onChange={(e) => handleTravelerChange(index, 'lastName', e.target.value)}
                    />
                    <input
                        type="date"
                        placeholder="Дата рождения"
                        value={traveler.dateOfBirth}
                        onChange={(e) => handleTravelerChange(index, 'dateOfBirth', e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={traveler.email}
                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                    />
                    <input
                        type="tel"
                        placeholder="Телефон"
                        value={traveler.phone}
                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                    />
                    <select
                        value={traveler.gender}
                        onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                    >
                        <option value="MALE">Мужской</option>
                        <option value="FEMALE">Женский</option>
                    </select>
                </div>
            ))}
            <button onClick={handleAddTraveler}>Добавить пассажира</button>

            {/* Кнопка для создания заказа */}
            <button className="create-order-btn" onClick={handleCreateOrder}>Создать заказ</button>

            <button className="back-btn" onClick={() => navigate(-1)}>Назад к результатам</button>
        </div>
    );
};

export default FlightPriceConfirmation;
