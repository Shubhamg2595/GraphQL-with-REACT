const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking } = require('./merge')

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                console.log('TESTING', booking._doc);
                return transformBooking(booking);
            })
        }
        catch (err) {
            console.log('ERROR IN BOOKINGS QUERY ::: ', err);
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                user: '5e31b86d55c8fc6ac42227d4',
                event: fetchedEvent
            });

            const result = await booking.save();
            return transformBooking(result);
        }
        catch (err) {
            console.log('[ERROR IN BOOKEVENT :::]', err);
            throw err;
        }

    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event
        }
        catch (err) {
            throw err;
        }
    }

}