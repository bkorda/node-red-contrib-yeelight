import { Socket, createSocket } from 'dgram'

import { YeelightStatus } from '../model/index'

class DiscoveryService {
  multicastAddress = "239.255.255.250"
  multicastPort = 1982
  socket: Socket
  discoveryCallback?: (status: YeelightStatus) => void
  intervalTimer?: NodeJS.Timeout
  retryTimer = 10

  constructor(ip: string) {
    this.socket = createSocket({ type: "udp4", reuseAddr: true })
    this.socket.bind(this.multicastPort, () => {
      this.socket.setMulticastInterface(ip);
    })
    this.registerResponseHandler()
  }

  startDiscovery(retryTimer?: number) {
    retryTimer = retryTimer || 10
    try {
      this.initDiscoveryWithRetry()
    } catch(error) {
      console.error(`Got no network connection retrying in ${retryTimer} seconds`, error)
      setTimeout(() => this.startDiscovery(retryTimer), retryTimer * 1000)
      retryTimer = Math.min(retryTimer + 10, 200)
    }
  }

  initDiscoveryWithRetry() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer)
    }

    this.addMulticastMembership()
    this.intervalTimer = setInterval(() => this.searchForBulbs(), 1000);
  }

  addMulticastMembership() {
    this.socket.on("listening", () => {
      this.socket.addMembership(this.multicastAddress);
    });
  }

  searchForBulbs() {
    const message = Buffer.from(`M-SEARCH * HTTP/1.1\r\nHOST: ${this.multicastAddress}:${this.multicastPort}\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n`);
    this.socket.send(message, 0, message.length, this.multicastPort, this.multicastAddress);
  }

  registerResponseHandler() {
    this.socket.on("message", (message, rinfo) => {
      let status: YeelightStatus | undefined
      try {
        status = new YeelightStatus(message.toString())
      } catch (ignore) {}

      if (status && this.discoveryCallback) {
        this.discoveryCallback(status)
      }
    });
  }
}

export { DiscoveryService }
