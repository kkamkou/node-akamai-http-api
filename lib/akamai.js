/**
 * Licensed under the MIT License
 *
 * @author   Kanstantsin A Kamkou (2ka.by), Alexander Günther
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/node-akamai-http-api
 */

// required stuff
var request = require('request'),
  crypto = require('crypto'),
  xml2js = require('xml2js'),
  qs = require('querystring'),
  _ = require('lodash');

// the class itself
var akamai = Object.create(null, {
  config: {
    writable: true,
    value: {
      key: null,
      keyName: null,
      host: null,
      ssl: false,
      verbose: false,
      request: {timeout: 20000}
    }
  }
});

/**
 * Updates the config object
 *
 * @param {Object} conf
 * @returns {akamai}
 */
akamai.setConfig = function (conf) {
  this.config = _.merge({}, this.config, conf);
  return this;
};

/**
 * Generates a random number
 *
 * @returns {String}
 */
akamai.getUniqueId = function () {
  var str = '';
  for (var i = 0, r; i < 6; i++) {
    if ((i & 0x03) === 0) {
      r = Math.random() * 0x100000000;
    }
    str += r >>> ((i & 0x03) << 3) & 0xff;
  }
  return str + process.pid;
};

/**
 * Returns the config object
 *
 * @returns {Object}
 */
akamai.getConfig = function () {
  return this.config;
};

/**
 * Returns a set of headers for the authentication process
 *
 * @param {String} path
 * @param {Object} queryObj
 * @returns {Object}
 */
akamai.getHeaders = function (path, queryObj) {
  var authData, authSign, query;

  query = qs.stringify(_.merge({version: 1, action: 'du', format: 'xml'}, queryObj || {}));

  authData = [
    5, '0.0.0.0', '0.0.0.0', parseInt(Date.now() / 1000, 10), this.getUniqueId(),
    this.getConfig().keyName
  ].join(', ');

  authSign = crypto.createHmac('sha256', this.getConfig().key)
    .update([authData + path.replace(/\/$/, ''), 'x-akamai-acs-action:' + query, null].join("\n"))
    .digest('base64');

  return {
    'X-Akamai-ACS-Action': query,
    'X-Akamai-ACS-Auth-Data': authData,
    'X-Akamai-ACS-Auth-Sign': authSign
  };
};

/**
 * Adds http or https to the host
 *
 * @param {String} path
 * @returns {String}
 */
akamai.getUri = function (path) {
  var host = ['http', this.getConfig().ssl ? 's' : '', '://', this.getConfig().host].join('');
  return [host, path.replace(/(^\/|\/$)/g, '')].join('/');
};

/**
 * Converts a xml string to an object
 *
 * @param {String} data
 * @param {Function} cb
 */
akamai.getObjectFromXml = function (data, cb) {
  (new xml2js.Parser())
    .parseString(data, function (err, result) {
      /* istanbul ignore if  */
      if (err) {
        return cb(err);
      }
      cb(null, _.mergeWith({}, result, function (a, b) {
        var obj = {};
        Object.keys(b).forEach(function (key) {
          if (key === '$') {
            obj.attribs = b[key];
          } else if (_.isArray(b[key])) {
            obj[key] = _.map(b[key], '$');
          }
        });
        return obj;
      }));
    });
};

/**
 * Returns a request object for streaming
 *
 * @param {String} path
 * @param {Object} params
 * @param {Function} cb
 * @returns {request}
 */
akamai.getRequestObject = function (path, params, cb) {
  var self = this,
    callback = function () {},
    options = _.merge(
      {url: this.getUri(path), headers: this.getHeaders(path, params.headers)},
      params.request, this.getConfig().request
    );

  if (typeof(cb) === 'function') {
    callback = function (err, resp, body) {
      if (err) {
        return cb(err);
      }

      // wrong response code
      if (resp.statusCode >= 300) {
        var exception = new Error();
        exception.code = resp.statusCode;
        exception.message = 'The server sent us the ' + resp.statusCode + ' code';
        if (self.getConfig().verbose && body) {
          exception.message += '. Body: ' + body;
        }
        return cb(exception);
      }

      if (!body.match(/^<\?xml\s+/)) {
        return cb(null, {status: resp.statusCode});
      }

      self.getObjectFromXml(body, cb);
    };
  }

  return request(options, callback);
};

/**
 * Sugar function to simplify calls
 * @param {string} path
 * @param {string} method
 * @param {object} headers
 * @param {function} cb
 * @returns {request}
 * @private
 */
akamai._simpleRequestObject = function (path, method, headers, cb) {
  return this.getRequestObject(path, {request: {method: method}, headers: headers}, cb);
};

/** Custom helpers **/

akamai.fileExists = function (path, cb) {
  this.stat(path, function (err, data) {
    if (err && err.message.indexOf('404 code') !== -1) {
      return cb(null, false);
    }
    if (data && data.stat && data.stat.file) {
      return cb(null, true);
    }
    /* istanbul ignore next */
    return cb(err);
  });
  return this;
};

/** Api functions **/

_.each(
    {stat: 'get', du: 'get', dir: 'get', 'delete': 'put', mkdir: 'put', rmdir: 'put'},
    function (method, fnc) {
      akamai[fnc] = function (path, cb) {
        this._simpleRequestObject(path, method, {action: fnc}, cb);
        return this;
      };
    }
);

akamai.upload = function (stream, path, cb) {
  stream
    .pipe(this._simpleRequestObject(path, 'put', {action: 'upload', 'upload-type': 'binary'}, cb));
  return this;
};

akamai.download = function (path, stream, cb) {
  this.getRequestObject(path, {headers: {action: 'download'}}, cb).pipe(stream);
  return this;
};

akamai.rename = function (pathFrom, pathTo, cb) {
  this._simpleRequestObject(pathFrom, 'put', {action: 'rename', destination: pathTo}, cb);
  return this;
};

akamai.symlink = function (pathFileTo, pathSymlink, cb) {
  this._simpleRequestObject(pathSymlink, 'put', {action: 'symlink', target: pathFileTo}, cb);
  return this;
};

akamai.mtime = function (path, date, cb) {
  if (!(date instanceof Date)) {
    cb(new TypeError('The date has to be an instance of Date'));
    return this;
  }
  this._simpleRequestObject(
    path, 'put', {action: 'mtime', mtime: parseInt(date.getTime() / 1000, 10)},
    cb
  );
  return this;
};

// exporting outside
module.exports = akamai;
