// instantiate framework
const fastify = require("fastify")({
  logger: true,
});
const cors = require("cors");
fastify.use(cors());

// routes
fastify.get("/", async (request, reply) => {
  return { hello: "onetwo" };
});

// run server
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listneing on ${address}`);
});
