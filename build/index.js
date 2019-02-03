"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./model/index");
var discovery_1 = require("./service/discovery");
var os = require('os');
var booleanValueMap = {
    'on': true,
    'off': false,
    'true': true,
    'false': false,
    'yes': true,
    'no': false
};
module.exports = function (RED) {
    var ifaces = os.networkInterfaces();
    var devices = new index_1.DeviceList();
    var discoveryServices = [];
    Object.values(ifaces)
        .reduce(function (a, b) { return a.concat(b); }, [])
        .filter(function (iface) { return iface.family === 'IPv4' && !iface.internal; })
        .map(function (iface) { return iface.address; })
        .forEach(function (ip) {
        console.log("Using " + ip + " to discover yeelights");
        var discoverService = new discovery_1.DiscoveryService(ip);
        discoverService.discoveryCallback = function (status) {
            devices.updateDevicesWithStatus(status);
        };
        discoverService.startDiscovery();
        discoveryServices.push(discoverService);
    });
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
