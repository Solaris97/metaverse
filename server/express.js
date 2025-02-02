import express from "express";
import {
  PUBLISH_CLIENT_DIRECTORY,
  PUBLISH_SERVER_DIRECTORY,
  pipeFile,
} from "./file.js";
import { metaverseData } from "./data.js";
import { serverLog } from "./log.js";

// create express server app
export function createServerApp() {
  const app = express();

  // default header setting
  app.use(function (request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.removeHeader("X-Powered-By");

    serverLog(`>>> API`, request.url);
    next();
  });

  // publish client index folder
  const staticClientIndexDirectory = express.static(
    PUBLISH_CLIENT_DIRECTORY + "/index"
  );
  app.use("/", staticClientIndexDirectory);

  // publish client map folder
  const staticClientMapDirectory = express.static(
    PUBLISH_CLIENT_DIRECTORY + "/map"
  );
  app.use("/map", staticClientMapDirectory);

  // load map (can joined user)
  app.get("/map/list/:mapId", async function (request, response) {
    const ip =
      request.socket.address().address ||
      request.headers["x-forwarded-for"] ||
      request.socket.remoteAddress;
    const isJoinedUser = metaverseData.users.some((user) => user.ip === ip);
    if (isJoinedUser === false) {
      response.statusCode = 401;
      response.end();
      return;
    }

    const fileDirectory =
      PUBLISH_SERVER_DIRECTORY + `/map/${request.params.mapId}.json`;
    pipeFile(response, fileDirectory);
  });

  // 404
  app.use("*", function (request, response) {
    response.statusCode = 404;
    response.end();
  });

  return app;
}
