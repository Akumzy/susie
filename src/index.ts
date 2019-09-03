"use strict";

import { PassThrough, Stream } from "stream";
import Transformer from "./transformer";
import { stringifyEvent } from "./utils";
import Hapi, { ResponseObject } from "@hapi/hapi";
const internals: {
  writeEvent?: (event: any, stream: PassThrough) => void;
  handleEvent?: (
    event: any,
    _options: any,
    streamOptions: any
  ) => ResponseObject;
} = {};

internals.writeEvent = function(event: any, stream: PassThrough) {
  if (event) {
    stream.write(stringifyEvent(event));
  } else {
    // closing time
    stream.write(stringifyEvent({ event: "end", data: "" }));
    stream.end();
  }
};

function handleEvent(event: any, _options: any, streamOptions: any) {
  let stream: PassThrough;

  const state = (this.request.plugins.susie = this.request.plugins.susie || {});

  // handle a stream arg

  if (event instanceof Stream.Readable) {
    state.mode = "stream";
    event.readable;
    // @ts-ignore
    if (event._readableState.objectMode) {
      const through = new Transformer(streamOptions, true);
      stream = new PassThrough();
      through.pipe(stream);
      event.pipe(through);
    } else {
      stream = new Transformer(streamOptions, false);
      event.pipe(stream);
    }

    return this.response(stream)
      .header("content-type", "text/event-stream")
      .header("content-encoding", "identity");
  }

  // handle a first object arg

  if (!state.stream) {
    stream = new PassThrough();
    state.stream = stream;
    state.mode = "object";
    const response = this.response(stream)
      .header("content-type", "text/event-stream")
      .header("content-encoding", "identity");
    internals.writeEvent(event, stream);
    return response;
  }

  // already have an object stream flowing, just write next event

  stream = state.stream;
  internals.writeEvent(event, stream);
}

export const plugin = {
  pkg: require("../package.json"),
  register: function(server: Hapi.Server) {
    server.decorate("toolkit", "event", handleEvent);
  }
};
