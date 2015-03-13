/**
 * Winston SQS
 * A Winston transpot that uses Amazon SQS to send messages.
 * MIT License
 */

var aws         = require("aws-sdk"),
    assert      = require("assert"),
    winston     = require("winston"),
    util        = require("util");

var SQS = winston.transports.SQS = module.exports = exports.SQS =  function (options) {

    if (!options.aws_queueurl) {
        throw new Error("options.aws_queueurl is required");
    }
    if ((!options.aws_secretaccesskey || !options.aws_accesskeyid) && !options.aws_credentials) {
        throw new Error("AWS credentials are required: either options.credentials or options.aws_accesskeyid + " +
                        "options.aws_secretaccesskey; actual options: " + JSON.stringify(options));
    }
    if (options.aws_credentials && ! (options.aws_credentials instanceof aws.Credentials)) {
        throw new Error("The value of options.aws_credentials must be an instance of AWS.Credentials; was: " +
                        options.aws_credentials);
    }

    options         = options || {};

    var credentials = (options.aws_secretaccesskey && options.aws_accesskeyid)?
            new aws.Credentials(options.aws_accesskeyid, options.aws_secretaccesskey)
            : options.aws_credentials;

    winston.Transport.call(this, options);

    this.name       = 'sqs';
    this.timestamp  = options.timestamp !== false;

    this.queueurl   = options.aws_queueurl;
    this.client     = new aws.SQS({
        credentials  : credentials,
        region : options.aws_region || "us-east-1",
        sslEnabled :  options.aws_sslenabled || true,
        maxRetries :  options.aws_maxretries || 3
    });
    this.debug = options.debug || false;

    // private
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
SQS.prototype.log = function( level, msg, meta, callback) {

    if (this.silent) {
        return callback(null, true);
    }

    if (typeof meta === 'function' && arguments.length == 3) {
        callback = meta;
        meta = {};
    }

    var output = formatLog({
        level:       level,
        message:     msg,
        meta:        meta,
        timestamp:   this.timestamp,
        formatter:   this.formatter
    });

    var self = this;

    this.client.sendMessage({ QueueUrl : this.queueurl, MessageBody : output}, function(err, response) {
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

function formatLog(options) {
    if (typeof options.formatter == 'function') {
        return String(options.formatter(winston.clone(options)));
    }

    var output = new Date().toISOString();
    output += ' : ';
    output += options.level;
    output += ' : ';
    output += options.message;
    output += ' : ';

    var meta = options.meta;
    if (meta !== null && meta !== undefined) {
        if (typeof meta !== 'object') {
            output += meta;
        }
        else if (Object.keys(meta).length > 0) {
            try {
             output += JSON.stringify(meta);
            }
            catch(err) {
                output += "metadata could not be output likely due to circular reference";
            }
        }
    }

    return output;
}
