# Amazon SQS Transport for Winston [![Build Status](https://api.travis-ci.org/agad/winston-sqs.png)](http://travis-ci.org/agad/winston-sqs)

Forked from (https://github.com/justin-roncal/winston-sqs)

## Installation via npm

``` sh
  $ npm install winston
  $ npm install winston-sqs-transport
```
## Usage
``` js
const { createLogger } = require('winston');
const { SQSTransport } = require('winston-sqs-transport');

const sqsTransport = new SQSTransport({
  queueUrl: 'your queueurl',
  accessKeyId: 'your awsCount',
  secretAccessKey: 'your awsSecretKey',
  region: 'your awsRegion'
});

var logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        sqsTransport
    ],
    exitOnError: false
})
```
