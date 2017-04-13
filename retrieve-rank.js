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

var RetrieveAndRankV1 = require('watson-developer-cloud/retrieve-and-rank/v1');
var debug = require('debug')('servicekit:retrieve-rank');
var noop = function () {};

/**
 * Helper creates a new instance of the watson service.
 */
function _newRnR(config) {
  return new RetrieveAndRankV1({
    username: config.username,
    password: config.password
  });
}

/** 
 * The retrieve and rank service wrapper factory.
 * @param {Object} config Configuration for the service.
 * @param {string} config.username 
 * @param {string} config.password 
 * @param {string} config.cluster_id Solr cluster id
 * @param {string} config.collection_name Solr collection name
 * @param {string} config.ranker_id Watson ranker id, optional
 * @param {string} config.row_count Count of rows to return, optional
 * @return {Object}
 */
module.exports = function create(config) {
  var retrieve = module.exports.newRnR(config);

  var solrClient = retrieve.createSolrClient({
    cluster_id: config.cluster_id,
    collection_name: config.collection_name,
    wt: 'json'
  });

  var row_count = config.row_count || 10;

  var searchSolr = function (text, cb) {
    if (!cb) cb = noop;

    var query = solrClient.createQuery();
    query.q(text).fl(['*', 'score']).start(0).rows(row_count);

    solrClient.search(query, function (err, res) {
      if (err) {
        return cb(err);
      } else {
        debug('Found ' + res.response.numFound + ' documents.');
        debug(res);
        return cb(null, res);
      }
    });
  };

  var searchAndRank = function (text, rankerId, cb) {
    if (typeof (rankerId) === 'function') {
      cb = rankerId;
      rankerId = config.ranker_id;
      debug('Using ranker id from config', rankerId);
    }

    if (!cb) cb = noop;

    if (!rankerId) {
      return process.nextTick(
        function () {
          return cb(new Error('Cannot rank results without a valid ranker id.'));
        }
      );
    }

    var query = {
      q: text,
      ranker_id: rankerId,
      start: 0,
      rows: row_count
    };

    solrClient.get('fcselect', query, function (err, res) {
      if (err) {
        return cb(err);
      } else {
        debug('Found ' + res.response.numFound + ' documents.');
        debug(res);
        return cb(null, res);
      }
    });
  };

  var search = function (text, cb) {
    if (!cb) cb = noop;

    if (config.ranker_id) {
      return searchAndRank(text, cb);
    } else {
      return searchSolr(text, cb);
    }
  };

  return {
    solrClient: solrClient,
    searchSolr: searchSolr,
    searchAndRank: searchAndRank,
    search: search
  };
};

module.exports.newRnR = _newRnR;
