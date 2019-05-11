node-akamai-http-api
====================
Akamai NetStorage HTTP API for Node.js (Unofficial).  

[![Build Status](https://travis-ci.org/kkamkou/node-akamai-http-api.svg?branch=master)](https://travis-ci.org/kkamkou/node-akamai-http-api)
[![Coverage Status](https://coveralls.io/repos/github/kkamkou/node-akamai-http-api/badge.svg?branch=master)](https://coveralls.io/github/kkamkou/node-akamai-http-api?branch=master)
[![Code Climate](https://codeclimate.com/github/kkamkou/node-akamai-http-api/badges/gpa.svg)](https://codeclimate.com/github/kkamkou/node-akamai-http-api)

* Official library [might be found here](https://github.com/akamai-open/NetStorageKit-Node)  
(though, the quality of this library is suspicious).

## Installation
```
"dependencies": {
  "akamai-http-api": "0.6.*" // see the "releases" section
}
```
```npm update```

## Initialization
```javascript
var akamai = require('akamai-http-api');
akamai.setConfig({
  keyName: 'keyName',
  key: 'aLongString',
  host: 'changeme.akamaihd.net',
  ssl: true, // optional, default: false
  verbose: false, // optional, default: false
  request: { // optional, request.js options, see: https://github.com/request/request#requestoptions-callback
    timeout: 20000 // 20s is the dafault value
  }
});
```

### Notices
1. You have to [enable the netstorage HTTP API](https://control.akamai.com/dl/customers/NS/NetStrgHttpCM.pdf) access using the control.akamai.com website
2. Ensure there are no more than 15 operations/second on netstorage, otherwise you can expect netstorage to serve 500 errors.
3. Double check the `host` value. In case of typo (fe: `test.upload.akamai.com`), the client just sits there trying to open up a socket. Default timeout is `20s`.

## API
### Advanced
#### upload
```javascript
var fs = require('fs'),
  stream = fs.createReadStream('cool/file.jpg');
akamai.upload(stream, '/12345/MyFolder/MyFile.jpg', function (err, data) {});
```
#### download
```javascript
var fs = require('fs'),
  stream = fs.createWriteStream('cool/file_download.jpg');
akamai.download(pathRemoteFile, stream, function (err, data) {});
```
#### mtime
```javascript
akamai.mtime('/12345/MyFolder/MyFile.jpg', new Date(), function (err, data) {});
```

### Basic
#### du
```javascript
akamai.du('/12345/MyFolder', function (err, data) {});
```
#### dir
```javascript
akamai.dir('/12345/MyFolder', function (err, data) {});
```
#### stat
```javascript
akamai.stat('/12345/MyFolder', function (err, data) {});
```
#### delete
```javascript
akamai.delete('/12345/MyFolder/MyFile.jpg', function (err, data) {});
```
#### mkdir
```javascript
akamai.mkdir('/12345/MyFolder', function (err, data) {});
```
#### rmdir
```javascript
akamai.rmdir('/12345/MyFolder', function (err, data) {});
```
#### rename
```javascript
akamai.rename('/12345/MyFile.jpg', '/12345/MyFileNew.jpg', function (err, data) {});
```
#### symlink
```javascript
akamai.symlink('/12345/MyFile.jpg', '/12345/MyFileSymlink.jpg', function (err, data) {});
```

### Helpers
#### fileExists
```javascript
akamai.fileExists('/12345/MyFile.jpg', function (err, boolFlag) {});
```

### Exceptions
For the communication netstorage HTTP API uses [HTTP codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).
Hence, a number of methods may trigger an exception. For example `mkdir` in case the target already exists.
Or `symlink` in case the target doesn't exist.

To handle these exceptions the `err` object has an abnormal `code` attribute.

```javascript
akamai.mkdir('...', function (err, data) {
  if (err.code === 409) { } // it already exists
  if (err.message.indexOf(409) !== -1) // the same
});
```

### How to extend it?
```javascript
var akamai = require('akamai-http-api'),
  _ = require('lodash'),
  myAkamai = Object.create(akamai);

// custom headers for the upload function
myAkamai.upload = function (stream, path, custHeaders, cb) {
  var options = {
    request: {method: 'put'},
    headers: _.extend({action: 'upload', 'upload-type': 'binary'}, custHeaders)
  };
  stream.pipe(this.getRequestObject(path, options, cb));
  return this;
};

// quick-delete function (you should enable it first!)
myAkamai.quickDelete = function (path, cb) {
  var options = {
    request: {method: 'put'},
    headers: {action: 'quick-delete', 'quick-delete': 'imreallyreallysure'}
  };
  this.getRequestObject(path, options, cb);
  return this;
};

// exporting outside
module.exports = myAkamai;
```

# Tests
## Docker
```sh
# modify test/akamai.js#19-21 first
[sudo] docker build -t node-akamai-http-api .
[sudo] docker run -ti --rm node-akamai-http-api
```

## NVM
```sh
export AKAMAI_KEY_NAME="key_name"
export AKAMAI_KEY="key"
export AKAMAI_HOST="domain.akamaihd.net"
nvm install [6, 8, 10, 12, etc.]
npm install
npm test
```

#### License

[MIT](LICENSE)
