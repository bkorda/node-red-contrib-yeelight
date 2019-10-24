var index_1 = require("../model/index");
const EventEmitter = require('events');

var devices = new index_1.DeviceList();
const myEvent = new EventEmitter();


module.exports.getDeviceList = function() {
    return devices;
}

module.exports.setDeviceList = function(deviceList) {
    devices = deviceList;
    myEvent.emit('add');
}