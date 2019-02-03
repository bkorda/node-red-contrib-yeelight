import { Yeelight, YeelightStatus } from './index'

class DeviceList {
  yeelights: Array<Yeelight> = []
  updateDevicesWithStatus(status: YeelightStatus) {
    const foundBulb = new Yeelight(status)
    const match = this.deviceById(foundBulb.info.id)

    if (match) {
      match.lastSeen = new Date()
      match.updateState(status)
    } else {
      this.yeelights.push(foundBulb)
    }
  }

  deviceById(id: string): Yeelight {
    let matches = this.yeelights.filter(bulp => bulp.info.id === id)
    return matches[0]
  }
}

export default DeviceList
