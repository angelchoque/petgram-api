const {startApolloServer} = require('./app')

const {typeDefs, resolvers} = require('./schema')
// const PORT = process.env.PORT || 3000
startApolloServer(typeDefs, resolvers)
// app.listen(PORT, () => console.log("server on port 3000"))