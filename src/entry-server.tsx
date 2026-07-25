import { createStartHandler, defaultStartHandlerManager } from "@tanstack/react-start/server";
import { getRouter } from "./router";

const handler = createStartHandler({
  createRouter: getRouter,
})(defaultStartHandlerManager);

export default handler;
