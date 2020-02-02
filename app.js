const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');


const app = express();

app.use(bodyParser.json());

app.use(
    "/graphql",
    graphqlHttp({
        schema: buildSchema(`

    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        createdEvents: [Event!]
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input UserInput {
        email: String!
        password: String!
    }

    

    type RootQuery{
        events: [Event!]! 
 
    }

    type RootMutation{
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User

    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }`),
        rootValue: {
            events: () => {
                return Event.find().populate('creator')
                    .then(events => {
                        return events.map(event => {
                            return { 
                                ...event._doc,
                                 _id: event.id,
                                 creator: {
                                     ...event._doc.creator._doc,
                                     _id: event._doc.creator.id
                                 }
                                
                                };
                        });
                    })
                    .catch(err => {
                        console.log('[ERROR IN FETCHING EVENTS] ::: ', err);
                        throw err;
                    })
            },
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: '5e31b86d55c8fc6ac42227d4'
                });
                let createdEvent;
                return event
                    .save()
                    .then(result => {
                        createdEvent = {
                            ...result._doc,
                            _id: result._doc._id.toString()
                        };
                        return User.findById('5e31b86d55c8fc6ac42227d4')


                    })
                     .then(user => {
                        if (!user) {
                            throw new Error('User not found .');
                        }
                        user.createdEvents.push(event);
                        return user.save();
                    }).then(result => {

                        return createdEvent
                    })
                    .catch(err => {
                        console.log('[ERROR IN CREATING EVENT]', err);
                        throw err;
                    });
            },
            createUser: args => {
                return User.findOne({
                    email: args.userInput.email
                }).then(user => {
                    if (user) {
                        throw new Error('User already exists.');
                    }
                    return bcrypt
                        .hash(args.userInput.password, 12)
                }).then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })
                    return user.save();
                }).then(result => {
                    return { ...result._doc, password: null, _id: result.id };
                }).catch(err => {
                    console.log('ERROR IN hashPassword ::: ', err);
                    throw err;
                })


            }
        },
        graphiql: true
    })
);

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ixl3c.mongodb.net/${process.env.MONDO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3001);
    })
    .catch(err => console.log('[ERROR IN DB CONNECTION] ::: ', err))

