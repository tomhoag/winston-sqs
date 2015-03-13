var aws = require("aws-sdk");
var vows = require('vows');
var assert = require('assert');
var winston = require('winston');
var helpers = require('winston/test/helpers');
var SQS = require('../lib/winston-sqs').SQS;

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
        },
        "aws_credentials must be aws.Credentials": function (){
            assert.throws(function() {new (SQS)({
                aws_queueurl: "queueurl",
                aws_credentials: "not an aws.Credentials instnace"
            });}, Error);
        }

    },
    "The creation of an Amazon SQS Transport instance": {
        "should succeed with aws_accesskeyid and aws_secretaccesskey": function() {
            assertSQS(new (SQS)({
                aws_queueurl: "queueurl",
                aws_accesskeyid: "publickey",
                aws_secretaccesskey: "secretkey"
            }));
        },
        "should succeed with aws_credentials": function() {
            assertSQS(new (SQS)({
                aws_queueurl: "queueurl",
                aws_credentials: new aws.Credentials("dummy id", "dummy secret")
            }));
        },
        "should succeed with aws_credentials using a subclass": function() {
            assertSQS(new (SQS)({
                aws_queueurl: "queueurl",
                aws_credentials: new aws.EnvironmentCredentials()
            }));
        }
    },
    "An instance of the Amazon SQS Transport": {
        "should have the proper methods defined": function () {
            assertSQS(new (SQS)(allOptions));
        }
         /* // Uncomment this test when correct AWS credentials and queue URL are provided in env vars
        ,"the log() method": helpers.testNpmLevels(
            new (SQS)({
                aws_queueurl: process.env.AWS_QUEUEURL,
                aws_accesskeyid: process.env.AWS_ACCESS_KEY_ID,
                aws_secretaccesskey: process.env.AWS_SECRET_ACCESS_KEY
            }),
            "should log messages to Amazon SQS",
            function (ign, err, logged) {
                console.log("Assertin results....");
                assert.isTrue(!err);
                assert.isTrue(logged);
        })// */
    }
}).export(module);
