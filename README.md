# Akamai NetStorage HTTP API for the Node.js


## Initialization
```javascript
var akamai = require('akamai');
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
