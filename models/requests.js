const mongoose = require('mongoose');

const searchQuerySchema = new mongoose.Schema({
    originLocationCode: String,
    destinationLocationCode: String,
    departureDate: String,
    returnDate: String,
    adults: Number,
    children: Number,
    infants: Number,
    travelClass: String,
    currencyCode: String,
    maxPrice: Number,
    nonStop: Boolean,
    max: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchQuery', searchQuerySchema);
