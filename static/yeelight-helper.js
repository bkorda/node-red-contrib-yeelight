var index_1 = require("../model/index");
var devices = new index_1.DeviceList();

module.exports.getDeviceList = function() {
    return devices;
}

module.exports.setDeviceList = function(deviceList) {
    devices = deviceList;
}

function fillDeviceSelector(nodeItem, selectItemElementName) {
    function optionForDevice(device, selectedId) {
        const selected = (selectedId && device.info.id == selectedId) ? 'selected' :
          '';
        console.log("selected " +  selectedId + " "+ selected);
        return `<option value='${device.info.id}' ${selected}>${device.address.ip} - ${device.info.id}</option>`
      }
    
      $.get('yeelight/devices', (fetchedDevices) => {
        if (fetchedDevices.error) {
          console.log(fetchedDevices.error)
          return;
        }
  
        var devices = {}
        fetchedDevices.forEach((device) => {
          devices[device.info.id] = device
        })
  
        if (fetchedDevices.length > 0) {
          let html = fetchedDevices
            .map(device => optionForDevice(device, nodeItem))
            .reduce((a, b) => a + b)
          $(selectItemElementName).html(html);
          $(selectItemElementName).removeAttr('disabled')
        }
      }, 'json')
}