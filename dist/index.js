"use strict";
const stream_1 = require("stream");
const transformer_1 = require("./transformer");
const utils_1 = require("./utils");
const internals = {};
internals.writeEvent = function (event, stream) {
    if (event) {
        stream.write(utils_1.stringifyEvent(event));
    }
    else {
        // closing time
        stream.write(utils_1.stringifyEvent({ event: "end", data: "" }));
        stream.end();
    }
};
async function handleEvent(event, _options, streamOptions) {
    let stream;
    const state = (this.request.plugins.susie = this.request.plugins.susie || {});
    // handle a stream arg
    if (event instanceof stream_1.Stream.Readable) {
        state.mode = "stream";
        event.readable;
        // @ts-ignore
        if (event._readableState.objectMode) {
            const through = new transformer_1.default(streamOptions, true);
            stream = new stream_1.PassThrough();
            through.pipe(stream);
            event.pipe(through);
        }
        else {
            stream = new transformer_1.default(streamOptions, false);
            event.pipe(stream);
        }
        return this.response(stream)
            .header("Content-Encoding", "identity")
            .header("Content-Type", "text/event-stream; charset=utf-8")
            .header("Cache-Control", "no-cache, no-store, must-revalidate")
            .header("Connection", "keep-alive");
    }
    // handle a first object arg
    if (!state.stream) {
        stream = new stream_1.PassThrough();
        state.stream = stream;
        state.mode = "object";
        const response = this.response(stream)
            .header("Content-Encoding", "identity")
            .header("Content-Type", "text/event-stream; charset=utf-8")
            .header("Cache-Control", "no-cache, no-store, must-revalidate")
            .header("Connection", "keep-alive");
        internals.writeEvent(event, stream);
        return response;
    }
    // already have an object stream flowing, just write next event
    stream = state.stream;
    internals.writeEvent(event, stream);
}
exports.plugin = {
    pkg: require("../package.json"),
    register: function (server) {
        server.decorate("toolkit", "event", handleEvent);
    }
};
