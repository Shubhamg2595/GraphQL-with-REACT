const Event = require('../../models/event');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge')


module.exports = {
    events: async () => {
        try {
            let events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
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
            date: dateToString(args.eventInput.date),
            creator: '5e31b86d55c8fc6ac42227d4'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
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

}