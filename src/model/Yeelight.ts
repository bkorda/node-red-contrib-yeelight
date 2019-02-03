import { Address, YeelightStatus } from './index'
import { Socket } from 'net'

class Yeelight {
  address: Address
  info: YeelightStatus
  lastSeen: Date
  // socket: Socket

  constructor(status: YeelightStatus) {
    this.lastSeen = new Date()
    this.info = status
    this.address = { ip: status.location.hostname, port: parseInt(status.location.port, 10)}
  }

  updateState(status: YeelightStatus) {
    this.info = status
  }

  async setPower(on: boolean) {
    let packet = {
      id: Math.round(Math.random()*1000000),
      method: 'set_power',
      params: [on ? 'on' : 'off', "smooth", 500]
    }

    return this.send(packet)
  }

  async setBrightness(value: number) {
    let packet = {
      id: Math.round(Math.random() * 1000000),
      method: 'set_bright',
      params: [value, "smooth", 500]
    }

    return this.send(packet)
  }

  send(packet) {
    return new Promise((resolve, reject) => {
        let socket = new Socket()
        let buffer = Buffer.from(JSON.stringify(packet) + "\r\n")
        socket.on('connect', () => {
          socket.write(buffer)
          socket.end()
          resolve()
        })
        socket.on('error', () => {
          socket.end()
          reject()
        })
        socket.connect(this.address.port, this.address.ip)
    })
  }
}

export default Yeelight
