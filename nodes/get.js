"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var helper = require("../static/yeelight-helper");

module.exports = function (RED) {
    class YeelightGet {
        constructor(config) {
            RED.nodes.createNode(this, config);
            var node = this;
            node.payload = config.payload;
            var deviceId = config.device;
            var devices = helper.getDeviceList()

            this.on('input', function (message) {
                var device = devices.deviceById(deviceId);
                if (!device) {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "node-red-contrib-yelight/out:status.device_not_set"
                    });
                    return;
                }
                message.device = device.info;
                node.send(message);
            });
        }
    }
    RED.nodes.registerType("yeelight-get", YeelightGet);
};