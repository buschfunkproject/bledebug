var util = require('util');
var bleno = require('bleno');
var exec = require('child_process');

const BLEDEBUG_UUID = "2008000D-1742-4035-94EA-F89BCEEE354F";
const TX_UUID = "2008000E-1742-4035-94EA-F89BCEEE354F";
const RX_UUID = "2008000F-1742-4035-94EA-F89BCEEE354F";


var net = require('net');
var fs = require('fs');

var server = net.createServer(function (stream) {
  stream.on('data', function (c) {
    console.log('data:', c.toString());
    sendMessage(c.toString());
  });
  stream.on('end', function () {
    //		      server.close();
  });
});

server.on('listening', function () {
  console.log('ok, server is running');
});

fs.unlinkSync('/tmp/ble.sock');

server.listen('/tmp/ble.sock');
fs.chmodSync('/tmp/ble.sock', 0777);

console.log("Starting Bleno BLE Debug Service");

bleno.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('bledebug', [BLEDEBUG_UUID], function (err) {
      console.log(err);
    });
  } else {
    console.log("will stopAdvertising");
    bleno.stopAdvertising();
  }
});


var rx = null;
var tx = null;

function sendMessage(data) {
  if (rx && rx._updateValueCallback) {
    rx._updateValueCallback(new Buffer(data));
  }
}

function parseCommand(data) {
  var response = '{"error":"invalid request"}';
  try {
    var jsonObject = JSON.parse(data);
    // No commands accepted at the moment!
  } catch (error) {
    console.log("invalid json! " + error);
  }
  return response;
}

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    rx = new RxCharacteristic();
    tx = new TxCharacteristic();
    result = bleno.setServices([
      new bleno.PrimaryService({
        uuid: BLEDEBUG_UUID,
        characteristics: [tx, rx]
      })
    ]);
  }
});


var TxCharacteristic = function () {
  console.log("Tx constructor");
  TxCharacteristic.super_.call(this, {
    uuid: TX_UUID,
    properties: ['write'],
  });
};
util.inherits(TxCharacteristic, bleno.Characteristic);
TxCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('TxCharacteristic - onWriteRequest: value = ' + data.toString('hex') + ' - ' + data);
  sendMessage(parseCommand(data));
  callback(this.RESULT_SUCCESS);
};

module.exports = TxCharacteristic;


var RxCharacteristic = function () {
  console.log("Rx constructor");
  RxCharacteristic.super_.call(this, {
    uuid: RX_UUID,
    properties: ['notify'],
  });
  this._updateValueCallback = null;
};
util.inherits(RxCharacteristic, bleno.Characteristic);
RxCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
};

RxCharacteristic.prototype.onUnsubscribe = function () {
  this._updateValueCallback = null;
};
module.exports = RxCharacteristic;