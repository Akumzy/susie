/// <reference types="node" />
import { Transform } from 'stream';
export default class Transformer extends Transform {
    counter: number;
    event: string;
    generateId: any;
    constructor(options: any, objectMode: boolean);
}
