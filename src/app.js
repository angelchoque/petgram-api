const express = require('express')
const cors = require("cors")
const morgan = require('morgan')
const { ApolloServer } = require('apollo-server-express')
const { expressjwt: jwt } = require("express-jwt");
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http =require('http');

// this is not secure! this is for dev purposes
process.env.JWT_SECRET = process.env.JWT_SECRET || 'somereallylongsecretkey'

async function startApolloServer(typeDefs, resolvers) {
  
  const app = express()
  const httpServer = http.createServer(app);
  app.use(morgan('tiny'))
  app.use(cors())
  app.use(express.json())

  const { categories } = require('../db/db.json')

  const authMiddleware = jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"] 
  })

  require('./adapter')

  const server = new ApolloServer({
    typeDefs, // para
    resolvers, // para
    introspection: true, // do this only for dev purposes
    playground: true, // do this only for dev purposes
    csrfPrevention: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
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

  await server.start();

  server.applyMiddleware({ app, path: '/graphql' });

  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

  app.get('/categories', function (req, res) {
    res.send(categories)
  })
}


module.exports = {startApolloServer}