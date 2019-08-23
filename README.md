# Amazon SQS Transport for [winston][0] [![Build Status](https://api.travis-ci.org/agad/winston-sqs.png)](http://travis-ci.org/agad/winston-sqs)
## Installation via npm

``` sh
  $ npm install winston
  $ npm install winston-sqs
```
## Usage
``` js
var logger = new winston.createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.SQS({
            queueUrl: '[SQS URL]',
            region: '[SQS Region]',
        }),
    ],
    exitOnError: false
})
```
## Setting up format
``` js
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
```