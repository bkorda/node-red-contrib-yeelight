"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var DeviceList = /** @class */ (function () {
    function DeviceList() {
        this.yeelights = [];
    }
    DeviceList.prototype.updateDevicesWithStatus = function (status) {
        var foundBulb = new index_1.Yeelight(status);
        var match = this.deviceById(foundBulb.info.id);
        if (match) {
            match.lastSeen = new Date();
            match.updateState(status);
        }
        else {
            this.yeelights.push(foundBulb);
        }
    };
    DeviceList.prototype.deviceById = function (id) {
        var matches = this.yeelights.filter(function (bulp) { return bulp.info.id === id; });
        return matches[0];
    };
    return DeviceList;
}());
exports.default = DeviceList;
