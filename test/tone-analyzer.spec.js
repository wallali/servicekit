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
const sinon = require('sinon');
const factory = require('../tone-analyzer');


describe('tone-analyzer', function () {
  var config;
  var fakeAnalyzer;

  beforeEach(function () {
    config = {};

    fakeAnalyzer = {
      tone: sinon.stub()
    };

    fakeAnalyzer.tone.callsArgWith(1, null, {});
  });

  it('defines tone constants', function () {
    assert(factory.tones);
  });

  describe('create', function () {
    it('calls newAnalyzer with supplied config', function () {
      factory.newAnalyzer = sinon.stub();
      config.username = 'user';

      factory(config);

      assert(factory.newAnalyzer.calledOnce);
      assert(factory.newAnalyzer.calledWithExactly(config));
    });

    it('adds version_date to config', function () {
      factory.newAnalyzer = sinon.stub();
      config.username = 'user';

      factory(config);

      assert(factory.newAnalyzer.calledOnce);
      assert(factory.newAnalyzer.args[0][0].version_date);
    });

    it('uses version_date from config', function () {
      factory.newAnalyzer = sinon.stub();
      config.version_date = '123';

      factory(config);

      assert(factory.newAnalyzer.calledOnce);
      assert.strictEqual(factory.newAnalyzer.args[0][0].version_date, '123');
    });
  });

  describe('tone', function () {

    beforeEach(function () {
      factory.newAnalyzer = () => fakeAnalyzer;

    });

    it('analyzes text tone with all tones and sentences setting by default', function (done) {
      var tone = factory(config);
      tone('some text', function () {
        assert(fakeAnalyzer.tone.calledOnce);
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].text, 'some text');
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].sentences, true);
        assert(!fakeAnalyzer.tone.args[0][0].tones);

        done();
      });
    });

    it('uses sentences and tones settings from config', function (done) {
      config.sentences = false;
      config.tones = factory.tones.social;

      var tone = factory(config);
      tone('some text', false, function () {
        assert(fakeAnalyzer.tone.calledOnce);
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].text, 'some text');
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].sentences, false);
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].tones, factory.tones.social);

        done();
      });
    });

    it('analyzes text tone and overrides sentences setting', function (done) {
      config.sentences = false;
      var tone = factory(config);
      tone('some text', true, function () {
        assert(fakeAnalyzer.tone.calledOnce);
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].text, 'some text');
        assert.strictEqual(fakeAnalyzer.tone.args[0][0].sentences, true);
        assert(!fakeAnalyzer.tone.args[0][0].tones);

        done();
      });
    });

    it('no error returs result', function (done) {
      fakeAnalyzer.tone.callsArgWith(1, null, 'result');
      var tone = factory(config);
      tone('some text', true, function (err, res) {
        assert(fakeAnalyzer.tone.calledOnce);

        assert(!err);
        assert(res);

        assert.strictEqual(res, 'result');

        done();
      });
    });

    it('on error returs error', function (done) {
      fakeAnalyzer.tone.callsArgWith(1, 'an error');
      var tone = factory(config);
      tone('some text', true, function (err, res) {
        assert(fakeAnalyzer.tone.calledOnce);

        assert(err);
        assert(!res);

        assert.strictEqual(err, 'an error');

        done();
      });
    });

    it('calls callback only once', function () {
      fakeAnalyzer.tone.callsArgWith(1, 'an error');
      var cb = sinon.spy();
      var tone = factory(config);
      tone('some text', true, cb);
      assert(cb.calledOnce);
    });

  });

});
