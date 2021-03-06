const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');



const eventLoader = new DataLoader((eventIds) => {
    return events(eventIds);
})


const userLoader = new DataLoader(userIds => {
    return User.find({ _id: { $in: userIds } });
})



// fetch events by IDs

const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: { $in: eventIds }
        });
        return events.map(event => {
            return transformEvent(event);
        });
    }
    catch (err) {
        throw err;
    }
}

// fetching a single event

const singleEvent = async eventId => {
    try {
        const event = await eventLoader.load(eventId.toString())
        return event;
    }
    catch (err) {
        console.log('ERROR IN singleEvent', err);
        throw err;
    }
}

// fetch User BY id
const user = async userId => {
    try {
        let user = await userLoader.load(userId.toString());

        return user = {
            ...user._doc,
            _id: user.id,
            createdEvents: eventLoader.loadMany.bind(this, user._doc.createdEvents)
        };

    }

    catch (err) {
        console.log('ERROR IN FETCHING USER BY ID ::: ', err);
        throw err;
    };
}



const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)

    }
}


const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
