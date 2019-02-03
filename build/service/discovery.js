"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var index_1 = require("../model/index");
var DiscoveryService = /** @class */ (function () {
    function DiscoveryService() {
        this.multicastAddress = "239.255.255.250";
        this.multicastPort = 1982;
        this.retryTimer = 10;
        this.socket = dgram_1.createSocket({ type: "udp4", reuseAddr: true });
        this.socket.bind(this.multicastPort);
        this.registerResponseHandler();
    }
    DiscoveryService.prototype.startDiscovery = function (retryTimer) {
        var _this = this;
        retryTimer = retryTimer || 10;
        try {
            this.initDiscoveryWithRetry();
        }
        catch (error) {
            console.error("Got no network connection retrying in " + retryTimer + " seconds", error);
            setTimeout(function () { return _this.startDiscovery(retryTimer); }, retryTimer * 1000);
            retryTimer = Math.min(retryTimer + 10, 200);
        }
    };
    DiscoveryService.prototype.initDiscoveryWithRetry = function () {
        var _this = this;
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
        this.addMulticastMembership();
        this.intervalTimer = setInterval(function () { return _this.searchForBulbs(); }, 1000);
    };
    DiscoveryService.prototype.addMulticastMembership = function () {
        var _this = this;
        this.socket.on("listening", function () {
            _this.socket.addMembership(_this.multicastAddress);
        });
    };
    DiscoveryService.prototype.searchForBulbs = function () {
        var message = Buffer.from("M-SEARCH * HTTP/1.1\r\nHOST: " + this.multicastAddress + ":" + this.multicastPort + "\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n");
        this.socket.send(message, 0, message.length, this.multicastPort, this.multicastAddress);
    };
    DiscoveryService.prototype.registerResponseHandler = function () {
        var _this = this;
        this.socket.on("message", function (message, rinfo) {
            var status;
            try {
                status = new index_1.YeelightStatus(message.toString());
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
