"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");

class YeelightStatus {
    constructor(multicastMessage) {
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
        if ("hue" in fields) {
            this.hue = parseInt(fields['hue'], 10);
        }

        if ("sat" in fields) {
            this.sat = parseInt(fields['sat'], 10);
        }
        
        this.bright = parseInt(fields['bright'], 10);
        this.ct = parseInt(fields['ct'], 10);
        this.model = fields['model'];
        this.support = fields['support'];
        this.color = '#' + parseInt(fields['color'], 10).toString(16);
        this.id = fields['id'];

        if ("bg_power" in fields) {
            this.bg_power = fields['bg_power'];
        }

        if ("bg_ct" in fields) {
            this.bg_ct = fields['bg_ct'];
        }

        if ("bg_bright" in fields) {
            this.bg_bright = fields['bg_bright'];
        }

        if ("bg_hue" in fields) {
            this.bg_hue = fields['bg_hue'];
        }

        if ("bg_sat" in fields) {
            this.bg_sat = fields['bg_sat'];
        }

        if ("bg_power" in fields) {
            this.bg_power = fields['bg_power'];
        }
    }

    toDictionary() {
        var dictionary = {};

        dictionary.power = this.power;
        dictionary.bright = this.bright;
        dictionary.ct = this.ct;

        if (this.model !== "mono") {
            dictionary.hue = this.hue;
            dictionary.sat = this.sat;
        }

        if (this.model == "ceiling") {
            dictionary.bg_power = this.bg_power;
            dictionary.bg_ct = this.bg_ct;
            dictionary.bg_bright = this.bg_bright;
            dictionary.bg_hue = this.bg_hue;
            dictionary.bg_sat = this.bg_sat;
            dictionary.bg_power = this.bg_power;
        }

        return dictionary;
    }
}

exports.default = YeelightStatus;
