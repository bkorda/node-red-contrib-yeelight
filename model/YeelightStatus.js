"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");
var YeelightStatus = /** @class */ (function () {
    function YeelightStatus(multicastMessage) {
        if (!multicastMessage.match(/yeelight/)) {
            throw Error("Not a yeelight status");
        }
        var fields = {};
        multicastMessage
            .split("\r\n")
            .map(function (line) { return line.match(/([^:]+):([^\r]+)$/); })
            .filter(function (result) { return !!result; })
            .forEach(function (result) { return fields[result[1].toLowerCase()] = result[2].trim(); });
        this.location = new url_1.URL(fields['location']);
        this.fw_ver = fields['fw_ver'];
        this.power = fields['power'] === 'on';
        this.hue = parseInt(fields['hue'], 10);
        this.sat = parseInt(fields['sat'], 10);
        this.color = '#' + parseInt(fields['color'], 10).toString(16);
        this.id = fields['id'];
    }
    return YeelightStatus;
}());
exports.default = YeelightStatus;
