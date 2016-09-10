var rp = require('request-promise');
var plist = require('plist');
var debug = require('debug')('LightWaveRF-Configuration');

var controller = require('./controller');

var parseRooms = function(lightwaveResponse, callback) {
  debug('Parsing lightwaveResponse: ', lightwaveResponse.content.estates[0].locations[0].zones[0].rooms[0].devices);

  var home = lightwaveResponse.content.estates[0].locations[0].zones[0];

  var rooms = [];
  for(var i=0; i < home.rooms.length; i++) {
    var r = home.rooms[i];
    var room = {
      name: r.name,
      number: r.room_number,
      status: r.name,
      active: r.active === 1,
      devices: []
    };

    rooms.push(room);

    debug("Room " + room.name + " with " + r.devices.length + " devices");

    for (var j = 0; j < r.devices.length; j++) {
      var d = r.devices[j];

      var device = {
        name: d.name,
        status: d.name,
        number: d.device_number,
        active: d.active === 1,
        dimmer: d.device_type_id === 2,
        switch: d.device_type_id === 1,
        mood: false
      };

      debug("Adding device", device)
      room.devices.push(device);
    }
  }

  debug('Rooms:', rooms)

  callback(rooms);
};

var getRooms = function(user, pin, callback) {
  debug('Getting rooms from LightWave');
  var host = 'https://control-api.lightwaverf.com';
  var json = rp.defaults({
    json: true
  });
  var auth, token;
  json.get(host + '/v1/user?password=' + pin + '&username=' + user)
  .then(function(res) {
    return json.get(host + '/v1/auth?application_key=' + res.application_key)
  })
  .then(function (res) {
    token = res.token;
    auth = json.defaults({
      headers: {
        'X-LWRF-token': token,
        'X-LWRF-platform': 'ios',
        'X-LWRF-skin': 'lightwaverf'
      }
    });

    return auth.get(host + '/v1/device_type?nested=1');
  })
  .then(function (res) {
    return auth.get(host + '/v1/user_profile?nested=1')
  })
  .then(function (res) {
    parseRooms(res, function(rooms) {
      controller.register(function() {
        if(callback) callback(rooms);
      });
    });
  });
};

module.exports = {
  getRooms: getRooms
};
