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

var allOptions = {
    aws_queueurl: "queueurl",
    aws_accesskeyid: "publickey",
    aws_secretaccesskey: "secretkey"
};

function without(o, property) { var r = JSON.parse(JSON.stringify(o)); r[property] = undefined; return r; }

vows.describe('winston-sqs').addBatch({
    "Creation of SQS Transport should fail if a required option is missing": {
        "queueurl": function (){
            assert.throws(function() {new (SQS)(without(allOptions, "aws_queueurl"));}, Error);
        },
        "accessKeyId (and secretAccessKey) (or credentials)": function (){
            assert.throws(function() {new (SQS)(without(allOptions, "aws_accesskeyid"));}, Error);
        },
        "(accessKeyId and) secretAccessKey (or credentials)": function (){
            assert.throws(function() {new (SQS)(without(allOptions, "aws_secretaccesskey"));}, Error);
        }

    },
    "An instance of the Amazon SQS Transport": {
        "should have the proper methods defined": function () {
            assertSQS(transport);
        }
        /* Uncomment this test when correct AWS credentials and queue URL are applied above.
        ,"the log() method": helpers.testNpmLevels(transport, "should log messages to Amazon SQS", function (ign, err, logged) {
            assert.isTrue(!err);
            assert.isTrue(logged);
        })*/
    }
}).export(module);
