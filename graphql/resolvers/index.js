const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');



// fetch events by IDs

const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: { $in: eventIds }
        });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        });
    }
    catch (err) {
        throw err;
    }
}

// fetching a single event

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        }
    }
    catch (err) {
        console.log('ERROR IN singleEvent', err);
        throw err;
    }
}


// fetch User BY id
const user = async userId => {
    try {
        let user = await User.findById(userId)

        return user = {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };

    }

    catch (err) {
        console.log('ERROR IN FETCHING USER BY ID ::: ',err);
        throw err;
    };
}


module.exports = {
    events: async () => {
        try {
            let events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });

        }
        catch (err) {
            console.log('[ERROR IN FETCHING EVENTS] ::: ', err);
            throw err;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                console.log('TESTING',booking._doc);
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            })
        }
        catch (err) {
            console.log('ERROR IN BOOKINGS QUERY ::: ', err);
            throw err;
        }
    },

    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5e31b86d55c8fc6ac42227d4'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5e31b86d55c8fc6ac42227d4')
            if (!creator) {
                throw new Error('creator not found .');
            }
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent

        }
        catch (err) {
            console.log('[ERROR IN CREATING EVENT]', err);
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({
                email: args.userInput.email
            })
            if (existingUser) {
                throw new Error('User already exists.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id };

        }
        catch (err) {
            console.log('ERROR IN hashPassword ::: ', err);
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
            return {
                ...result._doc,
                _id: result.id,
                user: user.bind(this, booking._doc.user),
                event: singleEvent.bind(this, booking._doc.event),
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            }


        }
        catch (err) {
            console.log('[ERROR IN BOOKEVENT :::]', err);
            throw err;
        }

    }
}