const createApp = require("./app");
const logger = require("./utils/logger");

const app = createApp();
const { port } = app.locals.config;

app.listen(port, () => {
  logger.info({ message: `auth-service listening on port ${port}` });
});

