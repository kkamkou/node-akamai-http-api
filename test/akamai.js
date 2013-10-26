/**
 * Licensed under the MIT License
 *
 * @author   Kanstantsin A Kamkou (2ka.by), Alexander Günther
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/node-akamai-http-api
 */

// required stuff
var path = require('path'),
  should = require('should'),
  akamai = require(path.join('..', 'lib', 'akamai'));

// config and the remote path for a file
var pathRemoteFile = '/CODE/FILE.jpg',
  config = {
    keyName: 'keyName',
    key: 'aLongString',
    host: 'changeme.akamaihd.net',
    ssl: true
  };

// test
module.exports = {
  before: function () {
    if (config.key === 'aLongString') {
      throw new Error('Please, change a config!');
    }
  },

  'Getters and Setters': {
    'setConfig()': function () {
      akamai.setConfig(config).getConfig().should.eql(config);
      akamai.getUri('/').should.eql('https://' + config.host + '/');
      akamai.setConfig({ssl: false}).getUri('/').should.eql('http://' + config.host + '/');
    },

    'getUniqueId()': function () {
      var out = [], i, curr;
      for (i = 0; i <= 1000; i++) {
        curr = akamai.getUniqueId();
        out.should.not.include(curr);
        out.push(curr);
      }
    }
  },

  'API functions': {
    'du()': {
      'Folder exists': function (done) {
        akamai.du(path.dirname(pathRemoteFile), function (err, data) {
          should.not.exist(err);
          data.should.have.property('du');
          data.du.should.have.properties(['du-info', 'attribs']);
          data.du['du-info'][0].should.have.properties(['files', 'bytes']);
          done();
        });
      },

      'Folder does not exist': function (done) {
        akamai.du('AnEpicFolder', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'dir()': {
      'Folder exists': function (done) {
        akamai.dir(path.dirname(pathRemoteFile), function (err, data) {
          should.not.exist(err);
          data.should.have.property('stat');
          data.stat.should.have.properties(['file', 'attribs']);
          data.stat.attribs.directory.should.be.eql(path.dirname(pathRemoteFile));
          data.stat.file.should.be.instanceof(Array);
          done();
        });
      },

      'Folder does not exist': function (done) {
        akamai.dir('AnEpicFolder', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'upload()': {
      'With permissions': function (done) {
        var fs = require('fs'),
          stream = fs.createReadStream(path.join(__dirname, '_files', 'file.jpg'));

        akamai.upload(stream, pathRemoteFile, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },

      'Without permissions': function (done) {
        var fs = require('fs'),
          stream = fs.createReadStream(path.join(__dirname, '_files', 'file.jpg'));

        akamai.upload(stream, '/1234', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'stat()': {
      'File exists': function (done) {
        akamai.stat(pathRemoteFile, function (err, data) {
          should.not.exist(err);
          data.should.have.property('stat');
          data.stat.should.have.properties(['file', 'attribs']);
          data.stat.file.should.be.instanceof(Array);
          data.stat.file[0].name.should.be.eql(path.basename(pathRemoteFile));
          done();
        });
      },
      'File does not exist': function (done) {
        akamai.stat('AnEpicFile.txt', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'delete()': {
      'File exists': function (done) {
        akamai.delete(pathRemoteFile, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },

      'File does not exist': function (done) {
        akamai.delete(pathRemoteFile + 'gg', function (err) {
          should.exist(err);
          done();
        });
      }
    }
  }
};
