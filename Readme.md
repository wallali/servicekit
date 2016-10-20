servicekit
===========
An assortment of useful service wrappers with a uniform initialisation and simplified client calls.


Setup
-----
[![NPM](https://nodei.co/npm/servicekit.png)](https://npmjs.org/package/servicekit)

Install via npm:
```sh
npm install servicekit --save
```

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
