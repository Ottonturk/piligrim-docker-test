import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import SearchFormResults from './components/SearchFormResults';
import FlightPriceConfirmation from './components/FlightPriceConfirmation';
import OrderConfirmation from './components/OrderConfirmation';
import { OrderProvider } from './OrderContext';
import './App.css';

const App = () => {
    const [searchResults, setSearchResults] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async (formData) => {
        try {
            console.log("Form data received in App.js:", formData);

            const response = await axios.get('/api/flights/results', {
                params: {
                    originLocationCode: formData.originLocationCode,
                    destinationLocationCode: formData.destinationLocationCode,
                    departureDate: formData.departureDate,
                    returnDate: formData.returnDate,
                    adults: formData.adults,
                    children: formData.children,
                    infants: formData.infants,
                    travelClass: formData.travelClass,
                    currencyCode: formData.currencyCode,
                    maxPrice: formData.maxPrice,
                    nonStop: formData.nonStop,
                    max: 250
                }
            });

            console.log('Search response:', response.data);
            setSearchResults(response.data);
            navigate('/api/flights/results');
        } catch (error) {
            console.error('Error fetching flight offers:', error);
        }
    };

    const handleCreateOrder = async (orderData) => {
        try {
            const response = await axios.post('/api/flights/create-order', orderData);
            navigate('/order-confirmation', { state: { orderDetails: response.data } });
        } catch (error) {
            console.error('Error creating flight order:', error);
        }
    };

    return (
        <OrderProvider>
            <Header />
            <main>
                <h1>Поиск авиабилетов</h1>
                <Routes>
                    <Route path="/" element={<SearchForm onSearch={handleSearch} />} />
                    <Route path="/api/flights/results" element={<SearchFormResults searchResults={searchResults} />} />
                    <Route path="/flight-price-confirmation" element={<FlightPriceConfirmation onCreateOrder={handleCreateOrder} />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                </Routes>
            </main>
            <Footer />
        </OrderProvider>
    );
};

export default App;
