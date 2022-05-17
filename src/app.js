const express = require('express')
const cors = require("cors")
const morgan = require('morgan')
const { ApolloServer } = require('apollo-server-express')
// const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
// const http = require('http');
// const jwt = require('express-jwt')
const { expressjwt: jwt } = require("express-jwt");

const { resolvers, typeDefs } = require('./schema')

// this is not secure! this is for dev purposes
process.env.JWT_SECRET = process.env.JWT_SECRET || 'somereallylongsecretkey'

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
// const httpServer = http.createServer(app);

const { categories } = require('../db/db.json')

// auth middleware
const authMiddleware = jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false
})

require('./adapter')

const server = new ApolloServer({
  typeDefs, // para
  resolvers, // para
  // csrfPrevention: true,
  // plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true, // do this only for dev purposes
  playground: true, // do this only for dev purposes
  context: ({ req }) => {
    const { id, email } = req.user || {}
    return { id, email }
  }
});

app.use(authMiddleware)

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  const { status } = err
  res.status(status).json(err)
}

app.use(errorHandler)

// server.start();

server.applyMiddleware({ app, path: '/graphql' });

new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);


// server.applyMiddleware({ app, path: '/graphql' })

app.get('/categories', function (req, res) {
  res.send(categories)
})

module.exports = app