import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Для перенаправления
import '../components/SearchFormResults.css'; // Подключение стилей
import { useLocation } from 'react-router-dom';
import log from 'loglevel'; // Подключаем loglevel
//import winston from 'winston';

// Настройка loglevel
log.setLevel('info'); // Устанавливаем уровень логирования

// Настройка логгера
//const logger = winston.createLogger({
  //  level: 'info',
    //format: winston.format.combine(
      //  winston.format.timestamp(),
        //winston.format.printf(({ timestamp, level, message }) => {
          //  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
       // })
    //),
   // transports: [
     //   new winston.transports.File({ filename: 'searchFormResults_log.txt' })
  //  ]
//});


const SearchFormResults = () => {
//const SearchFormResults = ({searchParams}) => {

    const location = useLocation();
    const navigate = useNavigate(); // Вызов useNavigate для навигации

    //const searchParams = location.state|| {}; // Получаем данные из state или пустой объект
    const searchParams = useMemo(() => location.state || {}, [location.state]); // Получаем данные из state или пустой объект


    const [flightResults, setFlightResults] = useState([]);
    const [loading, setLoading] = useState(true);
  ////  const [socket, setSocket] = useState(null); // Для хранения WebSocket соединения

    useEffect(() => {
        // Подключаемся к WebSocket-серверу
       // const ws = new WebSocket('ws://localhost:3001/ws');
      ////  const ws = new WebSocket('ws://localhost:3000/ws');
        

        ////ws.onopen = () => {
          ////  log.info('WebSocket connection established');
       //// };

        ////ws.onmessage = (message) => {
          ////  try {
           ////     const data = JSON.parse(message.data);
           ////     if (data.action === 'results') {
            ////        setFlightResults(data.results);
            ////        setLoading(false);
            ////        log.info('Received flight results:', data.results);
            ////    }
            ////} catch (error) {
            ////    log.error('Error parsing WebSocket message:', error);
           //// }
        ////};

        ////ws.onerror = (error) => {
        ////    log.error('WebSocket error:', error);
       //// };

       //// ws.onclose = () => {
      ////      log.info('WebSocket connection closed');
      ////  };

       //// setSocket(ws);

       //// return () => {
        ////    ws.close();
       //// };
   //// }, []);

    
   //// useEffect(() => {   
       
    ////    if (!socket || socket.readyState !== WebSocket.OPEN) {
    ////        log.warn('WebSocket is not connected.');
    ////        return;
    ////    }
        
        
        // Запрос данных с бэкенда
        if (Object.keys(searchParams).length === 0) {
            console.warn("No search parameters provided");
            return;
        }
        
        
        // Отправляем поисковые параметры через WebSocket
       //// socket.send(JSON.stringify({ action: 'search', data: searchParams }));


    

      //  logger.info(`Received search data: ${JSON.stringify(response.data)}`);
       // console.log("Search Params:", searchParams);
        log.info("Search Params:", searchParams);

        const fetchFlightResults = async () => {
            try {
                //const response = await axios.get('http://localhost:3000/api/flights/results', { params: searchParams });
                //делаем НЕотносит путь
                const response = await axios.get('/api/flights/results', { params: searchParams });
                ////const response = await axios.get('/api/flights/search', { params: searchParams });
                
                //// Предполагаем, что данные могут вернуться не в виде массива
                ////const results = response.data;
                //log.info("Raw API Response:", results); // Отладочный вывод


                const { data } = response.data; // Извлекаем массив рейсов из ключа `data`
                log.info("Raw API Response:", response.data);  // Для отладки можно оставить
                log.info("Extracted Flight Data:", data);      // Выводим извлеченные данные

                


                //// Проверяем, является ли результат массивом. Если нет, приводим к массиву
                /////// Проверяем структуру данных
                //////if (!Array.isArray(results)) {
                    //////log.warn("Unexpected data format:", results);
                    //////setFlightResults([]);  // Приводим к пустому массиву
                //////} else {
                    //setFlightResults(results);  // Устанавливаем данные в состояние
                    //////setFlightResults(Array.isArray(results));
                //////}

                // Проверяем, что `data` является массивом
                if (!Array.isArray(data)) {
                    log.warn("Unexpected data format: ", data);
                    setFlightResults([]); // Если это не массив, устанавливаем пустой результат
                } else {
                    setFlightResults(data); // Если это массив, сохраняем его в состоянии
                }

                /////setFlightResults(Array.isArray(results) ? results : []);  //корректно выполнено!!!!
                
                ////setFlightResults(response.data);  // Предполагается, что API вернет список рейсов



                setLoading(false);
                //console.log("Response data:", response.data);
               // logger.info(`Received Flight Results: ${JSON.stringify(response.data)}`);
               log.info("Received Flight Results:", response.data);

            } catch (error) {
               // console.error("Error fetching flight results:", error);

                log.error("Error fetching flight results:", error);

                setLoading(false);
                //logger.error(`Error fetching flight results: ${error.message}`);
            }
        };

        fetchFlightResults();
       // console.log("Search Params:", searchParams);
    ////}, [searchParams, socket]);
}, [searchParams]);  ///старая версия
     // Здесь добавлен ваш код проверки состояния загрузки и отсутствия результатов

    // 1. Если данные всё ещё загружаются, показываем сообщение

    // Обработчик для выбора конкретного предложения
const handleSelectFlightOffer = async (offer) => {
    try {
        log.info("Selected Flight Offer:", offer);

        // Отправляем запрос на подтверждение цены
        const response = await axios.post('/api/flights/confirm-price', { flightOffer: offer });

        log.info("Flight price confirmation response:", response.data);

        // Перенаправляем пользователя на страницу с подтвержденной ценой
        navigate('/flight-price-confirmation', { state: { confirmedPrice: response.data } });
    } catch (error) {
        log.error("Error confirming flight price:", error);
    }
};




    if (loading) {
        return <div className="loading">Загрузка результатов...</div>;
    }

    // 2. Если результаты пустые или не пришли, показываем сообщение "Рейсы не найдены"
   //// if (!flightResults || flightResults.length === 0) {
  ////  if (!Array.isArray(flightResults) || flightResults.length === 0) {
      ////  return <div className="no-results">Рейсы не найдены</div>;
  ////  }

  return (
    <div className="results-container">
        {/* Заголовок с параметрами поиска */}
        <div className="results-header">
            <div className="search-params">
                <span>Откуда: {searchParams.originLocationCode}</span>
                <span>Куда: {searchParams.destinationLocationCode}</span>
                <span>Дата отправления: {searchParams.departureDate}</span>
                <span>Дата прибытия: {searchParams.returnDate || 'Не указана'}</span>
                <span>Пассажиры: {searchParams.adults + (searchParams.children || 0) + (searchParams.infants || 0)}</span>
            </div>
            <button className="recalculate-btn">Пересчитать</button>
        </div>

        {/* Список результатов */}
        <div className="flight-results">
            {/* Используем условное отображение с проверкой через Array.isArray и длину */}
            {Array.isArray(flightResults) && flightResults.length > 0 ? (
                flightResults.map((flight, index) => (
                   // <div key={index} className="flight-card">
                    <div key={index} className="flight-card" onClick={() => handleSelectFlightOffer(flight)}>
                    {/* Блок "Сегменты перелета" */}    
                        {/* Блок "Сегменты перелета" */}
                        <div className="flight-segments">
                            {/* Сегмент туда */}
                            <div className="segment">
                                <div className="segment-info">
                                    <div className="departure">
                                        <span>{flight.departureTime}</span>
                                        <span>{flight.originLocation}</span>
                                        <span>{flight.departureDate}</span>
                                    </div>
                                    <div className="duration">
                                        <span>Время в пути: {flight.duration}</span>
                                    </div>
                                    <div className="arrival">
                                        <span>{flight.arrivalTime}</span>
                                        <span>{flight.destinationLocation}</span>
                                        <span>{flight.arrivalDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Сегмент обратно (если есть) */}
                            {flight.oneWay ? null : (
                                <div className="segment">
                                    <div className="segment-info">
                                        <div className="departure">
                                            <span>{flight.returnDepartureTime}</span>
                                            <span>{flight.returnOriginLocation}</span>
                                            <span>{flight.returnDepartureDate}</span>
                                        </div>
                                        <div className="duration">
                                            <span>Время в пути: {flight.returnDuration}</span>
                                        </div>
                                        <div className="arrival">
                                            <span>{flight.returnArrivalTime}</span>
                                            <span>{flight.returnDestinationLocation}</span>
                                            <span>{flight.returnArrivalDate}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Блок "Цена" */}
                        <div className="flight-price">
                            <span className="price">{flight.price.total} {flight.price.currency}</span>
                            <button className="refresh-price-btn">Обновить</button>
                            <div className="carrier">
                                <img src={flight.carrierLogo} alt={flight.carrierName} className="carrier-logo" />
                                <span className="carrier-name">{flight.carrierName}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-results">Рейсы не найдены</div>
            )}
        </div>
    </div>
);
};

export default SearchFormResults;
