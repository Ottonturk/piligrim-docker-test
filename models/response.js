const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    request: {
        type: String,
        required: true
    },
    response: {
        type: Object,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Response', responseSchema);
