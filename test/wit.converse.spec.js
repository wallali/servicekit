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
const factory = require('../wit/converse');

describe('wit.converse', function () {

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  var config = {
    accessToken: 'FBACCESSTOKEN',
    userTimezone: 'Europe/London',
    apiVersion: '20160516'
  };

  var context = {};

  const witUrl = 'https://api.wit.ai';

  beforeEach(function () {
    config = {
      accessToken: 'FBACCESSTOKEN',
      userTimezone: 'Europe/London',
      apiVersion: '20160516'
    };

    context = {};
  });

  it('calls /converse', function (done) {
    var scope = nock(witUrl)
      .post('/converse', body => !!body)
      .query(function (q) {
        return q.q === 'sample message' &&
          q.session_id === 'sessionId' &&
          !q.context &&
          !q.reset;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'sessionId', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('calls /converse with reset', function (done) {
    var scope = nock(witUrl)
      .post('/converse')
      .query(q => q.reset)
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'sessionId', context, true, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('calls /converse without text', function (done) {
    var scope = nock(witUrl)
      .post('/converse', body => !!body)
      .query(q => !q.q)
      .reply(200, {});

    const wit = factory(config);

    wit('', 'sessionId', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('calls /converse and callbacks when no context or reset supplied', function (done) {
    config.userTimezone = null;
    var scope = nock(witUrl)
      .post('/converse', body => !!body)
      .query(function (q) {
        return !q.context && q.session_id && q.q && !q.reset;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'session', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('calls /converse and callbacks when no reset supplied', function (done) {
    config.userTimezone = null;
    var scope = nock(witUrl, body => !!body)
      .post('/converse')
      .query(function (q) {
        return !q.context && q.session_id && q.q && !q.reset;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'session', context, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('always calls /converse with valid context', function (done) {
    config.userTimezone = null;
    var scope = nock(witUrl, body => !!body)
      .post('/converse')
      .query(function (q) {
        return !q.context && q.session_id && q.q && !q.reset;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'session', null, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses correct headers', function (done) {

    var scope = nock(witUrl)
      .matchHeader('accept', 'application/vnd.wit.20160516+json')
      .matchHeader('content-type', 'application/json')
      .matchHeader('authorization', 'Bearer FBACCESSTOKEN')
      .post('/converse')
      .query(true)
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', 'session', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses apiVersion from config', function (done) {

    config.apiVersion = '010101';
    config.userTimezone = null;

    var scope = nock(witUrl)
      .post('/converse')
      .query(function (q) {
        return q.v === config.apiVersion;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('message', 'session', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses userTimezone from config', function (done) {

    var scope = nock(witUrl)
      .post('/converse', body => body.timezone === 'Europe/London')
      .query(true)
      .reply(200, {});

    const wit = factory(config);

    wit('message', 'session', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses userTimezone from context', function (done) {

    var scope = nock(witUrl)
      .post('/converse', body => body.timezone === 'newtime')
      .query(true)
      .reply(200, {});

    const wit = factory(config);

    context.timezone = 'newtime';
    wit('message', 'session', context, false, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error', function (done) {

    var scope = nock(witUrl)
      .post('/converse')
      .query(true)
      .replyWithError('not found');

    const wit = factory(config);

    wit('sample message', 'session', context, false, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'not found');
      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error detail', function (done) {

    var scope = nock(witUrl)
      .post('/converse')
      .query(true)
      .reply(400, {
        error: 'error detail'
      });

    const wit = factory(config);

    wit('sample message', 'session', context, false, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'error detail');
      assert(scope.isDone());

      done();
    });
  });

  it('treats non 200 response as error', function (done) {

    var scope = nock(witUrl)
      .post('/converse')
      .query(true)
      .reply(400, {});

    const wit = factory(config);

    wit('sample message', 'session', context, false, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'Unexpected response status 400');
      assert(scope.isDone());

      done();
    });
  });
});
