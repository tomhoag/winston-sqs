/**
 * Winston SQS
 * A Winston transpot that uses Amazon SQS to send messages.
 * MIT License
 */

const { hostname } = require('os');
const { SQS } = require("aws-sdk");
const { format, transports, Transport } = require("winston");

 class SQSTransport extends Transport {
    constructor(options) {
      super(options);

        if (!options.queueUrl) {
            throw new Error("options.queueUrl is required");
        }

        if (!options.sqsOptions && !options.region) {
            throw new Error("options.region is required");
        }

        if (options.sqsOptions && options.region) {
            console.warn("winston-sqs: options.region is ignored if options.sqsOptions is provided.");
        }

        options = options || {};

        Transport.call(this, options);

        // Options unique to SQS
        this.name = 'sqs';
        this.silent = options.silent;
        this.queueurl = options.queueUrl;
        this.debug = options.debug || false;
        this.pid = options.pid || process.pid;
        this.env = options.env || process.env.NODE_ENV;
        this.encodedBase64 = options.encodedBase64;

        // Common transport options
        this.colorize = options.colorize || false;
        this.depth = options.depth || null;
        this.json = options.json || true;
        this.label = options.label || null;
        this.logstash = options.logstash || false;
        this.prettyPrint = options.prettyPrint || false;
        this.showLevel = options.showLevel === undefined ? true : options.showLevel;
        this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false;



        if (this.json) {
            this.stringify = options.stringify || function (obj) {
                return JSON.stringify(obj, null, 2);
            };
        }

        this._client = new SQS(options.sqsOptions || { region: options.region });

        // Private properties
        this._noErrorYet = true;
    }

    viewError(error, response){
        if (this._noErrorYet) {
            this._noErrorYet = false;
            console.warn("winston-sqs: Sending a message to " + this.queueurl + " failed",
            error, "(No further errors will be printed.)");
        }
        if (this.debug) {
            console.log("winston-sqs.sendMessage err=", error, ", response=", response);
        }
    }

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston.  Metadata is optional.
//
   async log(level, msg, meta, callback) {

        if (this.silent) {
            return callback(null, true);
        }

        if (typeof meta === 'function' && arguments.length == 3) {
            callback = meta;
            meta = {};
        }
        
        const output = {
            ...meta,
            message: msg,
            level: level,
            host: hostname(),
            env: this.env,
            pid: this.pid
        };

        const MessageBody = this.encodedBase64 ? Buffer.from(JSON.stringify(output)).toString('base64') : JSON.stringify(output);

        const self = this;
        
//         this._client.sendMessage({ QueueUrl: this.queueurl, MessageBody }, 
//         function (error, response) {
//             // Log the first error but keep silent afterwards not to spam the output
            
//             if(error){
//                 self.viewError(error, response);
//                 callback(error);                
//             } else {
//                 callback(null, response);
//                 self.emit('logged', response);
//             }       

//         });
        try {
          const response = await this._client.sendMessage({QueueUrl: this.queueurl, MessageBody }).promise();
          callback(null, response);
          self.emit('logged', response);
        } catch (error) {
         self.viewError(error);
         callback(error);
        }

        return null; // make linter happy
    }
}

module.exports = { SQSTransport }
