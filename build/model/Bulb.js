"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var YeelightBulb = /** @class */ (function () {
    // socket: Socket
    function YeelightBulb(status) {
        this.lastSeen = new Date();
        this.info = status;
        this.address = { ip: status.location.host, port: parseInt(status.location.port, 10) };
    }
    YeelightBulb.prototype.setPower = function (on) {
        var packet = {
            id: Math.round(Math.random() * 1000000),
            method: 'set_power',
            params: [on ? 'on' : 'off', "smooth", 500]
        };
        this.send(packet);
    };
    YeelightBulb.prototype.send = function (packet) {
        var socket = new net_1.Socket();
        var buffer = new Buffer(JSON.stringify(packet) + "\r\n");
        socket.on('connect', function () {
            socket.write(buffer);
            socket.end();
        });
        socket.connect(this.address.port, this.address.ip);
    };
    return YeelightBulb;
}());
exports.default = Bulb;
