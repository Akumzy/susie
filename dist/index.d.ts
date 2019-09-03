import { ResponseObject } from "@hapi/hapi";
import { PassThrough } from "stream";
declare module "@hapi/hapi" {
  interface ResponseToolkit {
    event(
      stream: PassThrough,
      options: any,
      streamOptions: any
    ): ResponseObject;
  }
}
