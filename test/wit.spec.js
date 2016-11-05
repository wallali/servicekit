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
const factory = require('../wit');

describe('wit', function () {

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

  it('calls /message', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(function (q) {
        return q.q === 'sample message';
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', context, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('calls /message and callbacks when no context supplied', function (done) {
    config.userTimezone = null;
    var scope = nock(witUrl)
      .get('/message')
      .query(function (q) {
        return q.context === '{}';
      })
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses correct headers', function (done) {

    var scope = nock(witUrl)
      .matchHeader('accept', 'application/vnd.wit.20160516+json')
      .matchHeader('authorization', 'Bearer FBACCESSTOKEN')
      .get('/message')
      .query(true)
      .reply(200, {});

    const wit = factory(config);

    wit('sample message', context, function (e, r) {
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
      .get('/message')
      .query(function (q) {
        return q.v === config.apiVersion;
      })
      .reply(200, {});

    const wit = factory(config);

    wit('message', context, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses userTimezone from config', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(function (q) {
        return q.context === '{"timezone":"Europe/London"}';
      })
      .reply(200, {});

    const wit = factory(config);

    wit('message', context, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('uses userTimezone from context', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(function (q) {
        return q.context === '{"timezone":"newtime"}';
      })
      .reply(200, {});

    const wit = factory(config);

    context.timezone = 'newtime';
    wit('message', context, function (e, r) {
      assert(r);
      assert(!e);

      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(true)
      .replyWithError('not found');

    const wit = factory(config);

    wit('sample message', context, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'not found');
      assert(scope.isDone());

      done();
    });
  });

  it('on error returns error detail', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(true)
      .reply(400, {
        error: 'error detail'
      });

    const wit = factory(config);

    wit('sample message', context, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'error detail');
      assert(scope.isDone());

      done();
    });
  });

  it('treats non 200 response as error', function (done) {

    var scope = nock(witUrl)
      .get('/message')
      .query(true)
      .reply(400, {});

    const wit = factory(config);

    wit('sample message', context, function (e, r) {
      assert(!r);
      assert(e);

      assert.strictEqual(e.message, 'Unexpected response status 400');
      assert(scope.isDone());

      done();
    });
  });
});
