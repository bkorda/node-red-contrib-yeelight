"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var helper = require("../static/yeelight-helper");

module.exports = function (RED) {
    class YeelightIn {
        constructor(config) {
            RED.nodes.createNode(this, config);
            var node = this;
            var deviceId = config.device;
            setTimeout(() => {
                node.connectToDevice(deviceId, node);
            }, 3000);
            // node.timeout = setInterval(node.connectToDevice, 10500, [deviceId, node]);
        }

        connectToDevice(deviceId, node) {
            var devices = helper.getDeviceList()
            var device = devices.deviceById(deviceId);
            
            if (device !== undefined) {
                node.device = device;
                device.stateUpdateCallback = function (status) {
                    if (!node.isStatusAreEquals(node.lastStatus, status)) {
                        node.lastStatus = status;
                        node.send([{
                                payload: node.formatStatus(status),
                                device: node.device
                            },
                            node.formatHomeKit(device.info)
                        ]);
                    }
                };
                clearInterval(node.timeout);
            }
        }

        isStatusAreEquals(status1, status2) {
            if (status1 === undefined) return false;
            if (status2 === undefined) return false;
            return status1.power === status2.power &&
            status1.hue === status2.hue &&
            status1.sat === status2.sat &&
            status1.bright === status2.bright &&
            status1.ct === status2.ct &&
            status1.color === status2.color
        }

        formatStatus(status) {
            return {
                "power" : status.power,
                "hue" : status.hue,
                "sat" : status.sat,
                "bright" : status.bright,
                "ct" : status.ct,
                "color" : status.color
            }
        }

        formatHomeKit(state) {
            var no_reponse = false;
        
            var msg = {};

            var characteristic = {};
            if (state !== undefined) {
                characteristic.Brightness = state.bright;
                characteristic.Hue = state.hue;
                characteristic.Saturation = state.sat;
                characteristic.On = state.power;
            }

            if (Object.keys(characteristic).length === 0) return null; //empty response

            msg.payload = characteristic;
            return msg;
        }
    }
    RED.nodes.registerType("yeelight-in", YeelightIn);
};