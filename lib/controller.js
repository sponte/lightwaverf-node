var dgram = require('dgram');
var util = require('util');

var transaction = 100;

function Controller(room, device) {
  this.room = room;
  this.device = device;
}

Controller.prototype.power = function(state, callback) {
  var command = util.format("!R%dD%dF%d|%s - %s |Light %s",
    this.room.number,
    this.device.number,
    state ? 1 : 0,
    this.room.name,
    this.device.name,
    state ? "on" : "off"
  )
  execCommand(command, callback)
}

Controller.prototype.brightness = function(state, callback) {

}

function execCommand(cmd, callback) {
  console.log("Executing command: %s", cmd);
  var socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  socket.on('message', function(msg, address) {
    console.log("Message received: %s", msg);
    socket.close();
    if(callback) callback();
  });

  socket.bind(9761, '0.0.0.0', function() {
    socket.setBroadcast(true);

    var message = new Buffer(++transaction + "," + cmd);
    console.log("Sending a message: %s", message);
    socket.send(message, 0, message.length, 9760, "255.255.255.255");
  });
}

function brightness() {}

function power(room, device, state, callback) {
  command("!R" + room + "D" + device + "F" + (state ? 1 : 0), callback)
}

function forRoomDevice(room, device) {
  return new Controller(room, device);
}

module.exports = {
  for: forRoomDevice
}
