# Amazon SQS Transport for Winston [![Build Status](https://api.travis-ci.org/agad/winston-sqs.png)](http://travis-ci.org/agad/winston-sqs)

Forked from (https://github.com/justin-roncal/winston-sqs)

## Installation via npm

``` sh
  $ npm install winston
  $ npm install winston-sqs-transport
```
## Usage
``` js
const { createLogger, format, transports } = require('winston');
const { SQSTransport } = require('winston-sqs-transport');
const { Config } = require('aws-sdk');

const { combine, timestamp, label, printf } = format;
 
const queueUrl = 'your queueUrl';
const sqsOptions = new Config();
sqsOptions.accessKeyId = 'your accessKeyId';
sqsOptions.secretAccessKey = 'your secretAccessKey';
sqsOptions.region = 'your region';

const sqsTrans = new SQSTransport({
  queueUrl: queueUrl,
  sqsOptions
});

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  });
 
const logger = createLogger({
    defaultMeta: {
        application: 'Your App'
    },
    format: combine(
        timestamp(),
        myFormat
      ),
    transports: [
        new transports.Console(),
        sqsTransport
    ],
    exitOnError: false
});

logger.info("Message in SQS AWS");

```
In your application console:

2020-06-18T12:46:38.493Z [INFO]: Message in SQS AWS

In your AWS SQS:
``` js
{
  message: 'Message in SQS AWS',
  level: 'info',
  application: 'Your App',
  timestamp: '2020-06-18T12:46:38.493Z',
  host: 'NBQSP-FC342',
  env: 'development',
  pid: '4852'
}
```

## Additional options 

debug -> displays the error when sending message

encodedBase64 -> transform message body in base64

silent in your unit tests -> In config winston 

``` js

const sqsTrans = new SQSTransport({
  queueUrl: queueUrl,
  sqsOptions,
  debug : true,
  encodedBase64 : true
});



```

silent send message in your unit tests -> In config winston 

``` js

export const logger = createLogger({
  levels,
  level: 'error',
  exitOnError: false,
  silent: true
  ....
  });
  
Or 
In your file test, import your logger and set properties silente for true:
logger.silent = true;   explicitly
logger.silent = process.env.NODE_ENV == 'test';  by env
 
```

ENJOY!!!
