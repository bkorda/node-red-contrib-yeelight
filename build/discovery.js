"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var YeelightStatus_1 = require("./model/YeelightStatus");
var DiscoveryService = /** @class */ (function () {
    function DiscoveryService() {
        this.multicastAddress = "239.255.255.250";
        this.multicastPort = 1982;
        this.socket = dgram_1.createSocket({ type: "udp4", reuseAddr: true });
        this.socket.bind(this.multicastPort);
        this.addMulticastMembership();
        this.registerResponseHandler();
    }
    DiscoveryService.prototype.startDiscovery = function () {
        var _this = this;
        setInterval(function () { return _this.searchForBulbs(); }, 1000);
    };
    DiscoveryService.prototype.addMulticastMembership = function () {
        var _this = this;
        this.socket.on("listening", function () {
            _this.socket.addMembership(_this.multicastAddress);
        });
    };
    DiscoveryService.prototype.searchForBulbs = function () {
        var message = Buffer.from("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n");
        this.socket.send(message, 0, message.length, this.multicastPort, this.multicastAddress);
    };
    DiscoveryService.prototype.registerResponseHandler = function () {
        var _this = this;
        this.socket.on("message", function (message, rinfo) {
            var status;
            try {
                status = new YeelightStatus_1.default(message.toString());
            }
            catch (ignore) { }
            if (status && _this.discoveryCallback) {
                _this.discoveryCallback(status);
            }
        });
    };
    return DiscoveryService;
}());
exports.DiscoveryService = DiscoveryService;
