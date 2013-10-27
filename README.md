node-akamai-http-api
====================
Akamai NetStorage HTTP API for the Node.js

## Installation
```
"dependencies": {
  "akamai-http-api": "0.1.1"
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
  ssl: true
});
```

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
