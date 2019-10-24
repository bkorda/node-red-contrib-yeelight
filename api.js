"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var os = require('os');

var discovery_1 = require("./service/discovery");
var helper = require("./static/yeelight-helper");

var NODE_PATH = '/yeelight/';

module.exports = function (RED) {
    var ifaces = os.networkInterfaces();
    var devices = helper.getDeviceList();
    var discoveryServices = [];

    Object.values(ifaces)
        .reduce(function (a, b) {
            return a.concat(b);
        }, [])
        .filter(function (iface) {
            return iface.family === 'IPv4' && !iface.internal;
        })
        .map(function (iface) {
            return iface.address;
        })
        .forEach(function (ip) {
            console.log("Using " + ip + " to discover yeelights");
            var discoverService = new discovery_1.DiscoveryService(ip);
            discoverService.discoveryCallback = function (status) {
                devices.updateDevicesWithStatus(status);
            };
            discoverService.startDiscovery();
            discoveryServices.push(discoverService);
        });

    RED.httpAdmin.get(NODE_PATH + 'devices', function (req, res) {
        console.log(devices.yeelights);
        res.send(devices.yeelights);
    });

    /**
     * Enable http route to static files
     */
    RED.httpAdmin.get(NODE_PATH + 'static/*', function (req, res) {
        var options = {
            root: __dirname + '/static/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options);
    });
}