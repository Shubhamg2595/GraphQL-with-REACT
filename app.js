const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if(req.method === 'OPTIONS')
    {
        return res.sendStatus(200);
    }
    next();
})

app.use(isAuth);


app.use(
    "/graphql",
    graphqlHttp({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true
    })
);

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ixl3c.mongodb.net/${process.env.MONDO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3001);
    })
    .catch(err => console.log('[ERROR IN DB CONNECTION] ::: ', err))

