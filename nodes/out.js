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

                            case 'hue':
                                var hue = parseInt(payload);
                                node.context().global.set("nrcy-hue", hue);
                                var sat = device.info.sat;
                                if (node.context().global.get("nrcy-sat") !== undefined) {
                                    sat = node.context().global.get("nrcy-sat");
                                }

                                device.setHSV(hue, sat, "smooth", 500);
                                break;

                            case 'sat':
                                var sat = parseInt(payload);
                                node.context().global.set("nrcy-sat", sat);
                                var hue = device.info.hue;
                                if (node.context().global.get("nrcy-hue") !== undefined) {
                                    hue = node.context().global.get("nrcy-hue");
                                }

                                device.setHSV(hue, sat, "smooth", 500);
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
                        node.formatHomeKit(message, payload, device, node);
                        break;

                    case 'str':
                    default: {
                        command = node.command;
                        break;
                    }
                }
            });
        }

        formatHomeKit(message, payload, device, node) {
            if (message.hap.context === undefined) {
                return null;
            }

            if (payload.On !== undefined) {
                device.setPower(payload.On);
            } else if (payload.Brightness !== undefined) {
                device.setBrightness(payload.Brightness);
            } else if (payload.Hue !== undefined) {
                node.context().global.set("nrcy-hue", payload.Hue);
                var sat = device.info.sat;
                if (node.context().global.get("nrcy-sat") !== undefined) {
                    sat = node.context().global.get("nrcy-sat");
                }
                device.setPower(true).then(function () {
                    return device.setHSV(payload.Hue, sat, "smooth", 500);
                });
            } else if (payload.Saturation !== undefined) {
                node.context().global.set("nrcy-sat", payload.Saturation);
                var hue = device.info.hue;
                if (node.context().global.get("nrcy-hue") !== undefined) {
                    hue = node.context().global.get("nrcy-hue");
                }
                device.setPower(true).then(function () {
                    return device.setHSV(hue, payload.Saturation, "smooth", 500);
                });
            }
        }

    }

    RED.nodes.registerType("yeelight-out", YeelightOut);
};