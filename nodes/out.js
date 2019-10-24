"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var booleanValueMap = {
    'on': true,
    'off': false,
    'true': true,
    'false': false,
    'yes': true,
    'no': false
};

var index_1 = require("../model/index");
var helper = require("../static/yeelight-helper");

module.exports = function (RED) {
    class YeelightOut {
        constructor(config) {
            RED.nodes.createNode(this, config);
            var node = this;
            node.payload = config.payload;
            node.command = config.command;
            node.payloadType = config.payloadType;
            node.commandType = config.commandType;
            
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

                var payload;
                switch (node.payloadType) {
                    case 'flow':
                    case 'global':
                        RED.util.evaluateNodeProperty(node.payload, node.payloadType, this, message, function (error, result) {
                            if (error) {
                                node.error(error, message);
                            } else {
                                payload = result;
                            }
                        });
                        break;

                    case 'yeelight_payload':
                        payload = node.payload;
                        break;

                    case 'num':
                        payload = parseInt(node.config.payload);
                        break;

                    case 'str':
                        payload = node.config.payload;
                        break;

                    case 'homekit':
                    case 'msg':
                    default:
                        payload = message[node.payload];
                        break;

                }

                var command;
                switch (node.commandType) {
                    case 'msg': {
                        command = message[node.command];
                        break;
                    }
                    case 'yeelight_cmd':
                        command = node.command;
                        switch (command) {
                            case 'on':
                                var payload_val = (typeof payload === 'string') ? payload.toLowerCase() : payload;
                                var booleanPayload = booleanValueMap[payload_val];
                                device.setPower(booleanPayload);
                                break;

                            case 'toggle':
                                device.toggle();
                                break;

                            case 'brightness':
                                var brightness = parseInt(payload, 10);
                                if (device.info.power === false) {
                                    device.setPower(true).then(function () {
                                        return device.setBrightness(brightness);
                                    });
                                } else {
                                    device.setBrightness(brightness);
                                }
                                break;

                            case 'rgb':
                                var values = payload.split(',');
                                device.setRGB(parseInt(values[0]), parseInt(values[1]), parseInt(values[2]), "smooth", 500);
                                break;
                            default: {
                                break;
                            }
                        }
                        break;

                    case 'homekit':
                        node.formatHomeKit(message, device);
                        break;

                    case 'str':
                    default: {
                        command = node.command;
                        break;
                    }
                }
            });
        }

        formatHomeKit(message, device) {
            if (message.hap.context === undefined) {
                return null;
            }

            var node = this;
            // var deviceMeta = node.server.getDevice(node.config.device);
            var command;
            if (payload.On !== undefined) {
                device.setPower(payload.On);
            } else if (payload.Brightness !== undefined) {
                device.setBrightness(payload.Brightness);
            }
        }
    }

    RED.nodes.registerType("yeelight-out", YeelightOut);
};