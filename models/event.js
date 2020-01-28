const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
})


// creating a model based on our event schema, that will be available across all mongoose instances.
// Model can be considered as a blueprint, which then incoporates that plan to create objects using which we can actually work in our application
//! model(modelName,schema)

module.exports = mongoose.model('Event',eventSchema);