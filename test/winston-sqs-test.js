var vows = require('vows');
var assert = require('assert');
var winston = require('winston');
var helpers = require('winston/test/helpers');
var SQS = require('../lib/winston-sqs').SQS;

var transport = new (SQS)({
    aws_queueurl: "https://sqs.us-east-1.amazonaws.com/542212936768/sendbunch_dev_transactions",
    aws_accesskeyid: "AKIAISWTU67EBWGKUOPA",
    aws_secretaccesskey: "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"
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
