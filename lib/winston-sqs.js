/**
 * Winston SQS
 * A Winston transpot that uses Amazon SQS to send messages.
 * MIT License
 */

var aws = require("aws-sdk"),
    assert = require("assert"),
    winston = require("winston"),
    winstonCommon = require('winston/lib/winston/common'),
    util = require("util"),
    flatted = require("flatted");

var SQS = winston.transports.SQS = module.exports = exports.SQS = function (options) {

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

    winston.Transport.call(this, options);

    // Options unique to SQS
    this.name = 'sqs';
    this.queueurl = options.queueUrl;
    this.debug = options.debug || false;

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

    this._client = new aws.SQS(options.sqsOptions || { region: options.region });

    // Private properties
    this._noErrorYet = true;
};

SQS.SQS = SQS;

util.inherits(SQS, winston.Transport);

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston.  Metadata is optional.
//
SQS.prototype.log = function (level, msg, meta, callback) {

    if (this.silent) {
        return callback(null, true);
    }

    if (typeof meta === 'function' && arguments.length == 3) {
        callback = meta;
        meta = {};
    }

    var output = {
        level: level,
        message: msg,
        meta: meta,
        // colorize: this.colorize,
        // depth: this.depth,
        // formatter: this.formatter,
        // humanReadableUnhandledException: this.humanReadableUnhandledException,
        // json: this.json,
        // label: this.label,
        // logstash: this.logstash,
        // prettyPrint: this.prettyPrint,
        // raw: this.raw,
        // showLevel: this.showLevel,
        // stringify: this.stringify,
        // timestamp: this.timestamp
    };

    var self = this;

    console.log(JSON.stringify(output))


    this._client.sendMessage({ QueueUrl: this.queueurl, MessageBody: JSON.stringify(output) }, function (err, response) {
        // Log the first error but keep silent afterwards not to spam the output
        if (err && self._noErrorYet) {
            self._noErrorYet = false;
            console.warn("winston-sqs: Sending a message to " + self.queueurl + " failed",
                err,
                "(No further errors will be printed.)");
        }
        if (self.debug) {
            console.log("winston-sqs.sendMessage err=", err, ", response=", response);
        }
        callback(err, !!response);
    });

    return null; // make linter happy
};
