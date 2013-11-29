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
  pathRemoteDir = path.join(path.dirname(pathRemoteFile), 'AkamaiHttpApi'),
  pathRemoteFileMtime = new Date(),
  config = {
    keyName: 'keyName',
    key: 'aLongString',
    host: 'changeme.akamaihd.net',
    ssl: true,
    verbose: false
  };

// tests
module.exports = {
  before: function () {
    if (config.key === 'aLongString') {
      throw new Error('Please, change a config!');
    }
    akamai.setConfig(config);
  },

  'Getters and Setters': {
    'Config set-up': function () {
      akamai.getConfig().should.eql(config);
      akamai.getUri('/').should.eql('https://' + config.host + '/');
      akamai.setConfig({ssl: false}).getUri('/').should.eql('http://' + config.host + '/');
    },

    'Unique Id generation': function () {
      var out = [], i, curr;
      for (i = 0; i <= 1000; i++) {
        curr = akamai.getUniqueId();
        out.should.not.include(curr);
        out.push(curr);
      }
    },

    'Verbosity check': function (done) {
      var clone = Object.create(akamai);
      clone.setConfig({key: 'invalidKey', verbose: true})
        .du(path.dirname(pathRemoteFile), function (err) {
          should.exist(err);
          err.message.should.include("You don't have permission to access");
          done();
        });
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

    'download()': {
      'File exists': function (done) {
        var fs = require('fs'),
          stream = fs.createWriteStream(path.join(__dirname, '_files', 'file_download.jpg'));

        akamai.download(pathRemoteFile, stream, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },
      'File does not exist': function (done) {
        var fs = require('fs'),
            stream = fs.createWriteStream(path.join(__dirname, '_files', 'file_download_err.jpg'));

        akamai.download('AnEpicFile.txt', stream, function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'mtime()': {
      'File exists': function (done) {
        akamai.mtime(pathRemoteFile, pathRemoteFileMtime, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },
      'File does not exist': function (done) {
        akamai.mtime('AnEpicFile.txt', new Date(), function (err) {
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
          data.stat.file[0].mtime.should.be.eql(parseInt(pathRemoteFileMtime.getTime() / 1000, 10));
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

    'fileExists()': {
      'File exists': function (done) {
        akamai.fileExists(pathRemoteFile, function (err, data) {
          should.not.exist(err);
          data.should.be.true;
          done();
        });
      },
      'File does not exist': function (done) {
        akamai.fileExists('AnEpicFile.txt', function (err, data) {
          should.not.exist(err);
          data.should.be.false;
          done();
        });
      }
    },

    'symlink()': {
      'File exists': function (done) {
        akamai.delete(pathRemoteFile + '.symlink', function () {
          akamai.symlink(pathRemoteFile, pathRemoteFile + '.symlink', function (err, data) {
            should.not.exist(err);
            data.should.have.property('status');
            data.status.should.be.eql(200);
            done();
          });
        });
      },
      'File does not exist': function (done) {
        akamai.symlink(pathRemoteFile + '.fake', pathRemoteFile + '.symlink', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'mkdir()': {
      'Folder does not exist': function (done) {
        akamai.mkdir(pathRemoteDir, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },
      'Folder exists': function (done) {
        akamai.mkdir(pathRemoteDir, function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'rmdir()': {
      'Folder exists': function (done) {
        akamai.rmdir(pathRemoteDir, function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },
      'Folder does not exist': function (done) {
        akamai.rmdir(pathRemoteDir, function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'rename()': {
      'File exists': function (done) {
        akamai.rename(pathRemoteFile, pathRemoteFile + '.renamed', function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },
      'File does not exist': function (done) {
        akamai.rename(pathRemoteFile, pathRemoteFile + '.renamed', function (err) {
          should.exist(err);
          done();
        });
      }
    },

    'delete()': {
      'File exists': function (done) {
        akamai.delete(pathRemoteFile + '.renamed', function (err, data) {
          should.not.exist(err);
          data.should.have.property('status');
          data.status.should.be.eql(200);
          done();
        });
      },

      'File does not exist': function (done) {
        akamai.delete(pathRemoteFile + '.renamed', function (err) {
          should.exist(err);
          done();
        });
      }
    }
  }
};
