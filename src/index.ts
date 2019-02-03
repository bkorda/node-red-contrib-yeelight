import { DeviceList, Yeelight } from './model/index'

import { DiscoveryService } from './service/discovery'
import { Red } from 'node-red'

const os = require('os');

let booleanValueMap: {[s: string]: boolean} = {
  'on': true,
  'off': false,
  'true': true,
  'false': false,
  'yes': true,
  'no': false
}

module.exports = function(RED: Red) {
  const ifaces: {[s: string]: any} = os.networkInterfaces();
  const devices = new DeviceList()
  const discoveryServices = []
  Object.values(ifaces)
    .reduce((a, b) => a.concat(b), [])
    .filter(iface => iface.family === 'IPv4' && !iface.internal)
    .map((iface: any) => iface.address)
    .forEach((ip: string) => {
        console.log(`Using ${ip} to discover yeelights`)
        const discoverService = new DiscoveryService(ip)
        discoverService.discoveryCallback = (status) => {
          devices.updateDevicesWithStatus(status)
        }
        discoverService.startDiscovery()
        discoveryServices.push(discoverService)
    })

  function universalNode(config: any) {
    RED.nodes.createNode(this, config)
    const node = this
    const deviceId = config.device;

    node.on('input', function(msg: any) {
      const device = devices.deviceById(deviceId)
      if (!device) {
        return
      }

      if (typeof msg.payload === 'number' || (parseInt(msg.payload, 10)+'') === msg.payload) {
        let brightness = parseInt(msg.payload, 10)
        if (device.info.power === false) {
          device.setPower(true).then(() => device.setBrightness(brightness))
        } else {
          device.setBrightness(brightness)
        }
      } else if(typeof msg.payload === 'string') {
        let payload = (typeof msg.payload === 'string') ? msg.payload.toLowerCase() : msg.payload
        let booleanPayload = booleanValueMap[payload]
        if (booleanPayload !== undefined) {
          device.setPower(booleanPayload)
          msg.payload = 'success'
        } else if (payload === 'toggle') {
          device.toggle()
        }
      }
      node.send(msg);
    })
  }

  RED.nodes.registerType("yeelight-local", universalNode);

  RED.httpAdmin.get('/yeelight-local/devices', (req: any, res: any) => {
    console.log(devices.yeelights)
    res.send(devices.yeelights)
  })
}
