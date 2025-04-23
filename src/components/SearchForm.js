import React, { useState } from 'react';
import '../components/SearchForm.css'; // Подключение CSS для стилей
import { useNavigate } from 'react-router-dom';
import log from 'loglevel'; // Подключаем loglevel
//import winston from 'winston';

// Настройка loglevel
log.setLevel('info'); // Устанавливаем уровень логирования

// Настройка логгера
//const logger = winston.createLogger({
   // level: 'info',
   // format: winston.format.combine(
   //     winston.format.timestamp(),
    //    winston.format.printf(({ timestamp, level, message }) => {
     //       return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    //   })
   // ),
   // transports: [
  //      new winston.transports.File({ filename: 'searchForm_log.txt' })
  //  ]
//});

// Логирование на фронтенде через console.log
const SearchForm = ({ onSearch }) => {
    
    const [formData, setFormData] = useState({
        originLocationCode: '',
        destinationLocationCode: '',
        departureDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        infants: 0,
        travelClass: 'ECONOMY',
        currencyCode: 'USD',
        maxPrice: '',
        nonStop: false
    });

    const [loading, setLoading] = useState(false); // Состояние загрузки
    const navigate = useNavigate(); // Инициализируем useNavigate

   //// const [socket, setSocket] = useState(null); // WebSocket

   // useEffect(() => {
        // Устанавливаем WebSocket соединение при монтировании компонента
    ////    const ws = new WebSocket('ws://localhost:3001/ws');
      //  const ws = new WebSocket('ws://localhost:3000/ws');
        

     //   ws.onopen = () => {
       //     log.info('WebSocket connection established');
        //};

        //ws.onerror = (error) => {
        //    log.error('WebSocket error:', error);
        //};

        //ws.onclose = () => {
         //   log.info('WebSocket connection closed');
        //};

        //setSocket(ws);

        // Закрываем соединение при размонтировании компонента
        //return () => {
        //    ws.close();
        //};
   //// }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Устанавливаем состояние загрузки в true

        try {
            //console.log("Submitting form with data:", formData); // Логируем данные формы
            // Логируем данные формы
            log.info("Submitting form with data:", formData);
           // logger.info(`Form data submitted: ${JSON.stringify(formData)}`);

         ////  if (socket && socket.readyState === WebSocket.OPEN) {
            // Отправляем данные на WebSocket-сервер
          ////  socket.send(JSON.stringify({ action: 'search', data: formData }));
          ////  }
            
            await onSearch(formData); // Отправляем данные для поиска
            ///navigate('/results', { state: formData }); // Навигация на страницу с результатами
            ////navigate('/api/flights/search', { state: formData }); // Навигация на страницу с результатами
            navigate('/api/flights/results', { state: formData }); // Навигация на страницу с результатами (корректно!!!!)
            


        } catch (error) {
          //  logger.error(`Error during search: ${error.message}`);
            //console.error('Error during search:', error); // Логирование ошибки
            // Логирование ошибки:
            log.error("Error during search:", error);
        } finally {
            setLoading(false); // Сбрасываем состояние загрузки
        }
    };

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            {/* Первая строка */}
            <div className="form-row">
                <div className="form-group">
                    <label>Откуда (IATA код):</label>
                    <input
                        type="text"
                        name="originLocationCode"
                        value={formData.originLocationCode}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Куда (IATA код):</label>
                    <input
                        type="text"
                        name="destinationLocationCode"
                        value={formData.destinationLocationCode}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Когда туда:</label>
                    <input
                        type="date"
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Когда обратно:</label>
                    <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Вторая строка */}
            <div className="form-row">
                <div className="form-group">
                    <label>Взрослых:</label>
                    <input
                        type="number"
                        name="adults"
                        value={formData.adults}
                        onChange={handleChange}
                        min="1"
                        max="9"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Дети:</label>
                    <input
                        type="number"
                        name="children"
                        value={formData.children}
                        onChange={handleChange}
                        min="0"
                        max="9"
                    />
                </div>
                <div className="form-group">
                    <label>Младенцы:</label>
                    <input
                        type="number"
                        name="infants"
                        value={formData.infants}
                        onChange={handleChange}
                        min="0"
                        max={formData.adults}
                    />
                </div>
                <div className="form-group">
                    <label>Класс обслуживания:</label>
                    <select
                        name="travelClass"
                        value={formData.travelClass}
                        onChange={handleChange}
                    >
                        <option value="ECONOMY">Эконом</option>
                        <option value="PREMIUM_ECONOMY">Премиум Эконом</option>
                        <option value="BUSINESS">Бизнес</option>
                        <option value="FIRST">Первый класс</option>
                    </select>
                </div>
            </div>

            {/* Третья строка */}
            <div className="form-row">
                <div className="form-group">
                    <label>Валюта (ISO 4217):</label>
                    <input
                        type="text"
                        name="currencyCode"
                        value={formData.currencyCode}
                        onChange={handleChange}
                        placeholder="USD"
                    />
                </div>
                <div className="form-group">
                    <label>Макс. цена (без копеек):</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={formData.maxPrice}
                        onChange={handleChange}
                        min="0"
                    />
                </div>
                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="nonStop"
                            checked={formData.nonStop}
                            onChange={handleChange}
                        />
                        Без остановок
                    </label>
                </div>
            </div>

            {/* Четвертая строка */}
            <div className="form-row">
                <button className="search-btn" type="submit" disabled={loading}>
                    {loading ? 'Поиск...' : 'Поиск'}
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
