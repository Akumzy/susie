'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const stream_1 = require("stream");
const transformer_1 = __importDefault(require("./transformer"));
const utils_1 = require("./utils");
function writeEvent(event, stream) {
    if (event) {
        stream.write(utils_1.stringifyEvent(event));
    }
    else {
        // closing time
        stream.write(utils_1.stringifyEvent({ event: 'end', data: '' }));
        stream.end();
    }
}
function handleEvent(event, _options, streamOptions) {
    let stream;
    const state = (this.request.plugins.susie = this.request.plugins.susie || {});
    // handle a stream arg
    if (event instanceof stream_1.Stream.Readable) {
        state.mode = 'stream';
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
            .header('content-type', 'text/event-stream')
            .header('content-encoding', 'identity');
    }
    // handle a first object arg
    if (!state.stream) {
        stream = new stream_1.PassThrough();
        state.stream = stream;
        state.mode = 'object';
        const response = this.response(stream)
            .header('content-type', 'text/event-stream')
            .header('content-encoding', 'identity');
        writeEvent(event, stream);
        return response;
    }
    // already have an object stream flowing, just write next event
    stream = state.stream;
    writeEvent(event, stream);
}
module.exports = {
    pkg: require('../package.json'),
    register: function (server) {
        server.decorate('toolkit', 'event', handleEvent);
    }
};
