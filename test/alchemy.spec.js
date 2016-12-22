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

/* eslint-disable no-unused-vars */

'use strict';

const assert = require('assert');
const sinon = require('sinon');
var factory = require('../alchemy');

describe('alchemy', function () {
  var config;
  var fakeAlchemy;

  beforeEach(function () {
    config = {
      apikey: '',
      extract: 'item'
    };

    fakeAlchemy = {
      combined: sinon.stub()
    };

    fakeAlchemy.combined.callsArgWith(1, null, {});
  });

  describe('create', function () {
    it('calls newAlchemy with supplied config', function () {
      factory.newAlchemy = sinon.stub();

      factory(config);

      assert(factory.newAlchemy.calledOnce);
      assert(factory.newAlchemy.calledWithExactly(config));

    });
  });

  describe('extract', function () {
    var alchemyExtract;
    const languageError = { code: 400, statusInfo: 'unsupported-text-language' };

    beforeEach(function () {

      factory.newAlchemy = () => fakeAlchemy;
      alchemyExtract = factory(config).extract;
    });

    it('calls IBM alchemy with passed text', function (done) {
      alchemyExtract('some text', function () {
        assert(fakeAlchemy.combined.calledOnce);

        assert.strictEqual(fakeAlchemy.combined.args[0][0].text, 'some text');

        done();
      });
    });

    it('calls IBM alchemy with config extract', function (done) {
      alchemyExtract('some text', function () {
        assert(fakeAlchemy.combined.calledOnce);

        assert.strictEqual(fakeAlchemy.combined.args[0][0].extract, 'item');

        done();
      });
    });

    it('calls IBM alchemy with config language', function (done) {
      config.language = 'english';
      alchemyExtract = factory(config).extract;
      alchemyExtract('some text', function () {
        assert(fakeAlchemy.combined.calledOnce);

        assert.strictEqual(fakeAlchemy.combined.args[0][0].language, 'english');

        done();
      });
    });

    it('uses json as output mode', function (done) {
      alchemyExtract('some text', function () {
        assert(fakeAlchemy.combined.calledOnce);

        assert.strictEqual(fakeAlchemy.combined.args[0][0].outputMode, 'json');

        done();
      });
    });

    it('removes "status" and "usage" from results', function (done) {
      fakeAlchemy.combined.callsArgWith(1, null, { status: 'OK', usage: 'license' });
      alchemyExtract('some text', function (err, res) {
        assert(res);
        assert(!err);

        assert(!res.status);
        assert(!res.usage);

        done();
      });
    });

    it('on error returns error', function (done) {
      fakeAlchemy.combined.callsArgWith(1, 'an error');
      alchemyExtract('some text', function (err, res) {
        assert(!res);
        assert(err);
        assert.strictEqual(err, 'an error');

        done();
      });
    });

    it('won\'t supress language error unless asked in config', function (done) {
      fakeAlchemy.combined.callsArgWith(1, languageError);
      alchemyExtract('some text', function (err, res) {
        assert(!res);
        assert(err);
        assert.deepStrictEqual(err, languageError);

        done();
      });
    });

    it('will supress language error if asked in config', function (done) {
      fakeAlchemy.combined.callsArgWith(1, languageError);
      config.ignore_unsupported_lang = true;
      alchemyExtract = factory(config).extract;
      alchemyExtract('some text', function (err, res) {
        assert(res);
        assert(!err);
        assert.deepStrictEqual(res, {});

        done();
      });
    });

    it('won\'t supress non-language errors', function (done) {
      fakeAlchemy.combined.callsArgWith(1, { code: 500, statusInfo: 'other' });
      config.ignore_unsupported_lang = true;
      alchemyExtract = factory(config).extract;
      alchemyExtract('some text', function (err, res) {
        assert(!res);
        assert(err);

        done();
      });
    });

  });
});
