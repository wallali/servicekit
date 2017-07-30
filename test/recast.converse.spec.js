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
const factory = require('../recast/converse');

describe('recast.converse', function () {

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
        uuid: 'dd881cfc-dbcd-492c-9e99-84a68f915e1b',
        source: 'I would like to order sushi',
        replies: [
          'Would you like to take out or to be delivered?'
        ],
        action: {},
        next_actions: [],
        memory: {},
        sentiment: 'neutral',
        entities: {},
        intents: [],
        conversation_token: '4c62a8b7addfa0a6b8b0b20ae8dce978',
        language: 'en',
        processing_languaga: 'en',
        timestamp: '2016-10-10T14:36:43.542475Z',
        version: '2.4.0',
        status: 200
      },
      message: 'Resource rendered with success'
    };
  });

  it('calls /converse with supplied message', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: 'sample message'
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses version from config', function (done) {

    config.apiVersion = 'v3';
    var scope = nock(endpoint + '/v3')
      .post('/converse')
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses language from config', function (done) {
    config.language = 'de';
    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: 'sample message',
        language: 'de'
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('sets language in config', function (done) {
    config.language = '<?';
    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: 'sample message'
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
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
      .post('/converse', {
        text: 'sample message',
        language: 'fr'
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    }).in('fr');
  });

  it('uses memory from call', function (done) {
    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: 'sample message',
        memory: { dream: 'a dream' }
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    }).recall({ dream: 'a dream' });
  });

  it('uses conversation token from call', function (done) {
    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: 'sample message',
        conversation_token: 'token1'
      })
      .reply(200, result);

    const converse = factory(config);

    converse('sample message', 'token1', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('no message returns error without calling api', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/converse', {
        text: ''
      })
      .reply(200, result);

    const converse = factory(config);

    converse('', function (e, r) {
      assert(!r);
      assert(e);

      assert(!scope.isDone());

      done();
    });
  });

  it('non 200 status code is error', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/converse')
      .reply(400, {});

    const converse = factory(config);

    converse('a message', function (e, r) {
      assert(!r);
      assert(e);

      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error', function (done) {

    var scope = nock(endpoint + '/v2')
      .post('/converse')
      .replyWithError('not found');

    const converse = factory(config);

    converse('a message', function (e, r) {
      assert(!r);
      assert(e);

      assert(scope.isDone());

      done();
    });
  });

});
