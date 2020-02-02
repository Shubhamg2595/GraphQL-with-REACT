const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');




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
        console.log(err);
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


    }
}