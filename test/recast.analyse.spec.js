/**
 * Copyright (c) 2016 Ali Lokhandwala <ali@huestones.co.uk>. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const nock = require('nock');
const factory = require('../recast/analyse');

describe('recast.analyse', function () {

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  var config = {
    requestToken: 'RECASTTOKEN',
  };

  var result = {};

  const endpoint = 'https://api.recast.ai';

  beforeEach(function () {
    config = {
      requestToken: 'RECASTTOKEN',
    };

    result = {
      results: {
        uuid: '21ec79d8-3865-40e3-be8b-f31d040efed8',
        source: 'What\'ll be the weather in London next Thursday?',
        intents: [],
        act: 'wh-query',
        type: 'desc:desc',
        sentiment: 'neutral',
        entities: {},
        language: 'en',
        processing_language: 'en',
        version: '2.4.0',
        timestamp: '2016-09-30T10:29:54.211866Z',
        status: 200
      },
      message: 'Resource rendered with success'
    };
  });

  it('calls /request with supplied message', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/request', {
        text: 'sample message'
      })
      .reply(200, result);

    const analyse = factory(config);

    analyse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('sends request token in header', function (done) {
    var scope = nock(endpoint + '/v2', {
        reqheaders: {
          'authorization': 'TOKEN RECASTTOKEN'
        }
      }
    ).post('/request').reply(200, result);

    const analyse = factory(config);

    analyse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses version from config', function (done) {

    config.apiVersion = 'v3';
    var scope = nock(endpoint + '/v3')
      .post('/request')
      .reply(200, result);

    const analyse = factory(config);

    analyse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses language from config', function (done) {
    config.language = 'de';
    var scope = nock(endpoint + '/v2')
      .post('/request', {
        text: 'sample message',
        language: 'de'
      })
      .reply(200, result);

    const analyse = factory(config);

    analyse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('sets language in config', function (done) {
    config.language = '<?';
    var scope = nock(endpoint + '/v2')
      .post('/request', {
        text: 'sample message'
      })
      .reply(200, result);

    const analyse = factory(config);

    analyse('sample message', function (e, r) {
      assert(r);
      assert(!e);
      assert.strictEqual(config.language, 'en');


      assert(scope.isDone());

      done();
    });
  });

  it('uses language from call', function (done) {
    config.language = 'de';
    var scope = nock(endpoint + '/v2')
      .post('/request', {
        text: 'sample message',
        language: 'fr'
      })
      .reply(200, result);

    const analyse = factory(config);

    analyse('sample message', 'fr', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('no message returns error without calling api', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/request', {
        text: ''
      })
      .reply(200, result);

    const analyse = factory(config);

    analyse('', function (e, r) {
      assert(!r);
      assert(e);

      assert(!scope.isDone());

      done();
    });
  });

  it('non 200 status code is error', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/request')
      .reply(400, {});

    const analyse = factory(config);

    analyse('a message', function (e, r) {
      assert(!r);
      assert(e);

      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/request')
      .replyWithError('not found');

    const analyse = factory(config);

    analyse('a message', function (e, r) {
      assert(!r);
      assert(e);

      assert(scope.isDone());

      done();
    });
  });

});
