"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const stream_1 = require("stream");
class Transformer extends stream_1.Transform {
    constructor(options = {}, objectMode) {
        super({ objectMode });
        this.counter = 1;
        this.event = options.event || null;
        this.generateId =
            options.generateId ||
                function () {
                    return this.counter++;
                };
    }
}
exports.default = Transformer;
Transformer.prototype._transform = function (chunk, _encoding, callback) {
    const event = {
        id: this.generateId(chunk),
        data: chunk
    };
    if (this.event) {
        event.event = this.event;
    }
    this.push(utils_1.stringifyEvent(event));
    callback();
};
Transformer.prototype._flush = function (callback) {
    this.push(utils_1.stringifyEvent({ event: "end", data: "" }));
    callback();
};
