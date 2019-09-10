import { ResponseObject, Plugin } from "@hapi/hapi";
import { PassThrough } from "stream";
declare const SSE: Plugin<any>;
export = SSE;

declare module "@hapi/hapi" {
  interface ResponseToolkit {
    event(
      stream: PassThrough,
      options: any,
      streamOptions: any
    ): ResponseObject;
  }
}
