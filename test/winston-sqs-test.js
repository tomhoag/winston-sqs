var vows = require('vows');
var assert = require('assert');
var winston = require('winston');
var helpers = require('winston/test/helpers');
var SQS = require('../lib/winston-sqs').SQS;

var transport = new (SQS)({
    aws_queueurl: "queueurl",
    aws_accesskeyid: "publickey",
    aws_secretaccesskey: "secretkey"
});

function assertSQS (transport) {
    assert.instanceOf(transport, SQS);
    assert.isFunction(transport.log);
}

vows.describe('winston-sqs').addBatch({
    "An instance of the Amazon SQS Transport": {
        "should have the proper methods defined": function () {
            assertSQS(transport);
        },
        "the log() method": helpers.testNpmLevels(transport, "should log messages to Amazon SQS", function (ign, err, logged) {
            assert.isTrue(!err);
            assert.isTrue(logged);
        })
    }
}).export(module);
