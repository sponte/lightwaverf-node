var http = require('http');
var plist = require('plist');

var parseRooms = function(plistObject, callback) {
  var rooms = [];
  for(var i=0; i < plistObject.rooms.length; i++) {
    rooms.push({
      name: plistObject.rooms[i],
      number: i + 1,
      status: plistObject.roomStatus[i],
      active: plistObject.roomStatus[i] != 'I'
    })
  }

  var devicesPerRoom = plistObject.deviceNames.length / plistObject.rooms.length;
  for(var r=0; r<rooms.length; r++) {
    var room = rooms[r];
    room.devices = [];
    for(var d=0; d<devicesPerRoom; d++) {
      var deviceName = plistObject.deviceNames[r * devicesPerRoom + d];
      var deviceStatus = plistObject.deviceStatus[r * devicesPerRoom + d];
      room.devices.push({
        name: deviceName,
        status: deviceStatus,
        number: d + 1,
        active: deviceStatus !== 'I',
        dimmer: deviceStatus === 'D',
        switch: deviceStatus === 'O',
        mood: deviceStatus === 'm'
      })
    }
  }

  callback(rooms);
};

var getRooms = function(user, pin, callback) {
  console.log('Getting rooms from LightWave');
  http.get("http://lightwaverfhost.co.uk/getsettingsxml.php?email=" + user + "&pin=" + pin, function(res) {
    var body = "";
    console.log("Got response: %s", res.statusCode);
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var lightwave = plist.parse(body);
      parseRooms(lightwave, callback);
    })
  });
};

module.exports = {
  getRooms: getRooms
};