node-akamai-http-api
====================
Akamai NetStorage HTTP API for the Node.js

## Installation
```
"dependencies": {
  "akamai-http-api": "0.2.1"
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
  ssl: true,
  verbose: false
});
```

### Notices
1. You have to [enable the netstorage HTTP API](https://control.akamai.com/dl/customers/NS/NetStrgHttpCM.pdf) access using the control.akamai.com website
2. Ensure there are no more than 15 operations/second on netstorage, otherwise you can expect netstorage to serve 500 errors.

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

## License
The MIT License (MIT)

Copyright (c) 2013 Kanstantsin Kamkou

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
