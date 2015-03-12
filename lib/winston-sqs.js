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

    options         = options || {};

    winston.Transport.call(this, options);

    this.name       = 'sqs';
    this.timestamp  = options.timestamp !== false;

    this.queueurl   = options.aws_queueurl;
    this.client     = new aws.SQS({
        credentials  : new aws.Credentials(options.aws_accesskeyid, options.aws_secretaccesskey),
        region : options.aws_region || "us-east-1",
        sslEnabled :  options.aws_sslenabled || true,
        maxRetries :  options.aws_maxretries || 3
    });

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

    this.client.sendMessage({ QueueUrl : this.queueurl, MessageBody : output}, function(err, response) {
        return callback(err, !!response);
    });
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
