import { URL } from 'url'

class YeelightStatus {
  location: URL
  fw_ver: string
  power: boolean
  hue: number
  sat: number
  color: string
  id: string

  constructor(multicastMessage: string) {
    if (!multicastMessage.match(/yeelight/)) {
      throw Error("Not a yeelight status")
    }

    let fields = {}
    multicastMessage
      .split("\r\n")
      .map(line => line.match(/([^:]+):([^\r]+)$/))
      .filter(result => !!result)
      .forEach(result => fields[result[1].toLowerCase()] = result[2].trim())

    this.location = new URL(fields['location'])
    this.fw_ver = fields['fw_ver']
    this.power = fields['power'] === 'on'
    this.hue = parseInt(fields['hue'], 10)
    this.sat = parseInt(fields['sat'], 10)
    this.color = '#' + parseInt(fields['color'], 10).toString(16)
    this.id = fields['id']
  }
}

export default YeelightStatus
