"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./model/index");
var discovery_1 = require("./service/discovery");
var discoverService = new discovery_1.DiscoveryService();
var devices = new index_1.DeviceList();
discoverService.discoveryCallback = function (status) {
    devices.updateDevicesWithStatus(status);
};
discoverService.startDiscovery();
var booleanValueMap = {
    'on': true,
    'off': false,
    'true': true,
    'false': false,
    'yes': true,
    'no': false
};
module.exports = function (RED) {
    function universalNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var deviceId = config.device;
        node.on('input', function (msg) {
            var device = devices.deviceById(deviceId);
            if (!device) {
                return;
            }
            if (typeof msg.payload === 'number' || (parseInt(msg.payload, 10) + '') === msg.payload) {
                var brightness_1 = parseInt(msg.payload, 10);
                if (device.info.power === false) {
                    device.setPower(true).then(function () { return device.setBrightness(brightness_1); });
                }
                else {
                    device.setBrightness(brightness_1);
                }
            }
            else if (typeof msg.payload === 'string') {
                var payload = (typeof msg.payload === 'string') ? msg.payload.toLowerCase() : msg.payload;
                var booleanPayload = booleanValueMap[payload];
                if (booleanPayload !== undefined) {
                    device.setPower(booleanPayload);
                    msg.payload = 'success';
                }
                else if (payload === 'toggle') {
                    device.toggle();
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("yeelight-local", universalNode);
    RED.httpAdmin.get('/yeelight-local/devices', function (req, res) {
        console.log(devices.yeelights);
        res.send(devices.yeelights);
    });
};
