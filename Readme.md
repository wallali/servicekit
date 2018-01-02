servicekit
===========
An assortment of useful service wrappers with uniform initialization and simplified client calls.

[![Build Status](https://travis-ci.org/wallali/servicekit.svg?branch=master)](https://travis-ci.org/wallali/servicekit)

The aim of this library is to provide some useful services with a standard initialization pattern for all services.
Furthermore the key calls for using those APIs have been greatly simplified using defaults for most parameters.

Setup
-----
[![NPM](https://nodei.co/npm/servicekit.png)](https://npmjs.org/package/servicekit)

Install via npm:
```sh
npm install servicekit --save
```

Usage
-----
Use services by importing and initializing them with a config. All services follow the same initialization pattern.

```javascript
var ta = require('servicekit/tone-analyzer')(config);

ta.tone('That sounds great', function(err, result){
  if(err) {
    // handle it
  }
});
```

Services
--------
The following services are presently in the kit:

- Conversation (https://www.ibm.com/watson/developercloud/conversation.html)
- Wit (http://wit.ai)
- Bing Spell Check (https://www.microsoft.com/cognitive-services/en-us/bing-spell-check-api/documentation)
- Tone Analyzer (https://www.ibm.com/watson/developercloud/doc/tone-analyzer/)
- Recast.ai (https://recast.ai)

Configure Local Dev Environment
---------------------------
### Step 1: Get the Code

First, you'll need to pull down the code from GitHub:
```
git clone https://github.com/wallali/servicekit.git
```

### Step 2: Install Dependencies

Second, you'll need to install the project dependencies as well as the dev dependencies. To do this, simply run the following from the directory you created in step 1:
```
npm install
```

### Step 3: Running Tests

With your local environment configured, running tests is as simple as:
```
npm test
```

Debugging
---------

`servicekit` uses the [debug module](https://github.com/visionmedia/debug) to output debug messages to the console. To output all debug messages, run your node app with the `DEBUG` environment variable:

```
DEBUG=servicekit:* node your-app.js
```
This will output debugging messages from `servicekit`.

License
-------

[Apache 2.0](https://github.com/wallali/servicekit/blob/master/LICENSE)
