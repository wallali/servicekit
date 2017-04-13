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

var assert = require('assert');
var factory = require('../retrieve-rank');
var sinon = require('sinon');

describe('retrieve-rank', function () {
  var config = {
    username: '',
    password: '',
    cluster_id: '123',
    collection_name: 'test',
    ranker_id: null,
    row_count: null
  };

  var retrieve_mock = {
    createSolrClient: sinon.stub()
  };

  var mock_client = {
    createQuery: sinon.stub(),
    search: sinon.stub(),
    get: sinon.stub()
  };

  factory.newRnR = function () {
    return retrieve_mock;
  };

  beforeEach(function () {
    config.username = '';
    config.password = '';
    config.cluster_id = '123';
    config.collection_name = 'test';
    config.ranker_id = null;
    config.row_count = null;

    retrieve_mock.createSolrClient.returns(mock_client);
  });

  afterEach(function () {
    retrieve_mock.createSolrClient.reset();
  });

  describe('factory', function () {

    it('creates solr client', function () {
      factory(config);
      assert(retrieve_mock.createSolrClient.called);
      assert(retrieve_mock.createSolrClient.calledWithExactly({
        cluster_id: '123',
        collection_name: 'test',
        wt: 'json'
      }));
    });

  });

  describe('operations', function () {
    var service = null;
    var mock_query = {
      q: sinon.stub(),
      fl: sinon.stub(),
      start: sinon.stub(),
      rows: sinon.stub()
    };

    var search_res = {};

    beforeEach(function () {
      service = factory(config);
      search_res.response = {
        numFound: 0
      };

      mock_client.createQuery.returns(mock_query);
      mock_client.search.callsArgWith(1, null, search_res);
      mock_client.get.callsArgWith(2, null, search_res);

      mock_query.q.returns(mock_query);
      mock_query.fl.returns(mock_query);
      mock_query.start.returns(mock_query);
      mock_query.rows.returns(mock_query);
    });

    afterEach(function () {
      mock_client.createQuery.reset();
      mock_client.search.reset();
      mock_client.get.reset();

      mock_query.q.reset();
      mock_query.fl.reset();
      mock_query.start.reset();
      mock_query.rows.reset();
    });

    it('searchSolr calls client search after building query and returns response in callback', function (done) {
      search_res.response.numFound = 1;
      service.searchSolr('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_query.q.calledOnce);
        assert(mock_query.fl.calledOnce);
        assert(mock_query.start.calledOnce);
        assert(mock_query.rows.calledOnce);
        assert(mock_client.search.calledOnce);
        assert(mock_client.search.calledAfter(mock_query.q));

        assert(mock_query.q.calledWith('sample'));
        assert(mock_query.start.calledWithExactly(0));
        assert(mock_query.fl.calledWith(['*', 'score']));

        assert.deepStrictEqual(r, search_res);

        done();
      });
    });

    it('searchSolr asks for 10 rows by default', function (done) {
      service.searchSolr('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_query.rows.calledOnce);
        assert(mock_query.rows.calledWithExactly(10));

        done();
      });
    });

    it('searchSolr asks for config.row_count by if supplied', function (done) {
      config.row_count = 21;
      service = factory(config);
      service.searchSolr('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_query.rows.calledOnce);
        assert(mock_query.rows.calledWithExactly(21));

        done();
      });
    });

    it('searchSolr returns error on error', function (done) {
      mock_client.search.callsArgWith(1, {}, null);
      service.searchSolr('sample', function (e, r) {

        assert(e);
        assert(!r);

        assert(mock_client.search.calledOnce);

        done();
      });
    });

    it('searchAndRank returns results after calling \'fcselect\' with config ranker id', function (done) {
      config.ranker_id = 'config-rank';
      service = factory(config);

      service.searchAndRank('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_client.get.calledOnce);
        assert(mock_client.get.calledWith('fcselect', {
          q: 'sample',
          ranker_id: 'config-rank',
          start: 0,
          rows: 10
        }));

        done();
      });
    });

    it('searchAndRank returns results after calling \'fcselect\' with supplied ranker id', function (done) {
      service.searchAndRank('sample', 'rank-1', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_client.get.calledOnce);
        assert(mock_client.get.calledWith('fcselect', {
          q: 'sample',
          ranker_id: 'rank-1',
          start: 0,
          rows: 10
        }));

        done();
      });
    });

    it('searchAndRank uses rows from config', function (done) {
      config.row_count = 22;
      service = factory(config);

      service.searchAndRank('sample', 'rank-1', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_client.get.calledOnce);
        assert(mock_client.get.calledWith('fcselect', {
          q: 'sample',
          ranker_id: 'rank-1',
          start: 0,
          rows: 22
        }));

        done();
      });
    });

    it('searchAndRank returns error if no ranker id', function (done) {
      service.searchAndRank('sample', function (e, r) {

        assert(e);
        assert(!r);

        assert(!mock_client.get.called);
        assert(e.message.match(/Cannot rank results without a valid ranker id/i));

        done();
      });
    });

    it('searchAndRank returns error on error', function (done) {
      mock_client.get.callsArgWith(2, {}, null);
      service.searchAndRank('sample', 'rank-1', function (e, r) {

        assert(e);
        assert(!r);

        assert(mock_client.get.calledOnce);

        done();
      });
    });

    it('search uses solr search when no ranker in config', function (done) {
      service.search('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(mock_client.search.calledOnce);
        assert(!mock_client.get.called);

        done();
      });
    });

    it('search uses ranked search when ranker in config', function (done) {
      config.ranker_id = 'config-ranker';
      service = factory(config);
      service.search('sample', function (e, r) {

        assert(!e);
        assert(r);

        assert(!mock_client.search.called);
        assert(mock_client.get.calledOnce);

        done();
      });
    });

  });
});
