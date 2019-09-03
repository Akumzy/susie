"use strict";
import { stringifyEvent } from "./utils";
import { Transform } from "stream";

export default class Transformer extends Transform {
  counter: number;
  event: string;
  generateId: any;
  constructor(options: any = {}, objectMode: boolean) {
    super({ objectMode });
    this.counter = 1;
    this.event = options.event || null;
    this.generateId =
      options.generateId ||
      function() {
        return this.counter++;
      };
  }
}

Transformer.prototype._transform = function(chunk, _encoding, callback) {
  const event: { [x: string]: any } = {
    id: this.generateId(chunk),
    data: chunk
  };

  if (this.event) {
    event.event = this.event;
  }

  this.push(stringifyEvent(event));
  callback();
};

Transformer.prototype._flush = function(callback) {
  this.push(stringifyEvent({ event: "end", data: "" }));
  callback();
};
