import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import log from 'loglevel';
import './FlightPriceConfirmation.css'; // Подключаем стили


log.setLevel('info');

const FlightPriceConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Данные подтвержденной цены передаются через состояние
    const confirmedPrice = location.state?.confirmedPrice;

    if (!confirmedPrice) {
        return <div>Нет данных о подтвержденной цене.</div>;
    }

    log.info("Confirmed Price:", confirmedPrice);

    // Проверяем, есть ли flightOffers и содержит ли массив хотя бы один элемент
    //const flightOffers = confirmedPrice.flightOffers;
    const flightOffers = confirmedPrice.data?.flightOffers;

    if (!flightOffers || flightOffers.length === 0) {
        return <div>Не удалось получить информацию о предложении.</div>;
    }

    // Проверяем наличие необходимых полей перед их отображением
    ////const priceTotal = confirmedPrice?.price?.total || 'Не указано';
    /////const priceTotal = confirmedPrice?.flightOffers[0]?.price?.total || "Не указано";
    const priceTotal =  flightOffers[0].price?.total || "Не указано";
    //  <p>Цена: {confirmedPrice.price.total} {confirmedPrice.price.currency}</p>
    /////const priceCurrency = confirmedPrice?.flightOffers[0]?.price?.currency || "Не указано";
    ////const priceCurrency = confirmedPrice?.price?.currency || 'Не указано';
    const priceCurrency =  flightOffers[0].price?.currency || "Не указано";
    
    //<p>Номер брони: {confirmedPrice.id}</p>

   //// const bookingId = confirmedPrice?.id || 'Не указано';

    /////const bookingId = confirmedPrice?.flightOffers[0]?.id || "Не указано";
    const bookingId =  flightOffers[0].id || "Не указано";
    //<p>Остаток доступных мест: {availableSeats}</p>
    /////const availableSeats = confirmedPrice?.flightOffers[0]?.numberOfBookableSeats || 'Не указано';
    const availableSeats =  flightOffers[0]?.numberOfBookableSeats || 'Не указано';


    //Новые параметры \_/:
    //код А/К:
    const flightDestination = flightOffers[0]?.itineraries[0]?.segments[0]?.aircraft?.code  || 'Не указано';

    

    //Сегмент N:

 //   const Segment = flightOffers[0]?.itineraries[0]?.segments[0]()  || 'Не указано';
   // Отправление по сегменту N:    
    //Дата и время отправления,
    const departureDestinationTime = flightOffers[0]?.itineraries[0]?.segments[0]?.departure?.at   || 'Не указано';
    //airport:
    const departureDestinationAirport = flightOffers[0]?.itineraries[0]?.segments[0]?.departure?.iataCode   || 'Не указано';
     //terminal:
     const departureDestinationTerminal = flightOffers[0]?.itineraries[0]?.segments[0]?.departure?.terminal   || 'Не указано';
    

    //Прибытие по сегменту N:
     
    //Дата и время прибытия
    const arrivalDestinationTime = flightOffers[0]?.itineraries[0]?.segments[0]?.arrival?.at   || 'Не указано';
    //airport:
    const arrivalDestinationAirport = flightOffers[0]?.itineraries[0]?.segments[0]?.arrival?.iataCode   || 'Не указано';
    //terminal:
    const arrivalDestinationTerminal = flightOffers[0]?.itineraries[0]?.segments[0]?.arrival?.terminal   || 'Не указано';
    

    return (
        <div className="price-confirmation-container">
            <h1>Подтверждение цены</h1>

            {/* Отображаем информацию о подтвержденной цене */}
            <div className="confirmation-details">
              
                <p>Цена: {priceTotal} {priceCurrency}</p>
                <p>Номер брони: {bookingId}</p>
                <p>Остаток доступных мест: {availableSeats}</p>
                <p>Код А/К {flightDestination}</p>

                
                
                <p>______________________________________________________________________________</p>

                <p>Отправление:________</p>
                <p>Время отправления {departureDestinationTime}</p>
                <p>Аэропорт прибытия {departureDestinationAirport}</p>
                <p>Терминал {departureDestinationTerminal}</p>
                


                <p>_______________________________________________________________________________</p>
                <p>Прибытие:________</p>
                <p>Время прибытия {arrivalDestinationTime}</p>
                <p>Аэропорт прибытия {arrivalDestinationAirport}</p>
                <p>Терминал {arrivalDestinationTerminal}</p>
                


                
            </div>

            <button className="back-btn" onClick={() => navigate(-1)}>Назад к результатам</button>
        </div>
    );
};

export default FlightPriceConfirmation;
