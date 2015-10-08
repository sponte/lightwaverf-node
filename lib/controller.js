var dgram = require('dgram');
var util = require('util');
var debug = require('debug')('LightWaveRF-Node: Controller')

var transaction = 100;
var busy = false;
var queue = [];

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

  queue.push([command, callback]);
  process()
}

function process() {
  if(busy) return
  if(queue.length == 0) return

  var item = queue.pop()
  busy = true
  setTimeout(execCommand, 200, item[0], item[1]);
}

Controller.prototype.brightness = function(state, callback) {

}

function execCommand(cmd, callback) {
  debug("Executing command: %s (%@)", cmd, callback);
  var socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  socket.on('message', function(msg, address) {
    debug("Message received: %s", msg);
    socket.close();
    busy = false;
    if(callback) {
      debug("Received callback");
      callback();
    }
    process()
  });

  socket.bind(9761, '0.0.0.0', function() {
    socket.setBroadcast(true);

    var message = new Buffer(++transaction + "," + cmd);
    debug("Sending a message: %s", message);
    socket.send(message, 0, message.length, 9760, "255.255.255.255");
  });
}

function register(callback) {
  queue.push(["!F*p", callback]);
  process();
}

function forRoomDevice(room, device) {
  return new Controller(room, device);
}

module.exports = {
  for: forRoomDevice,
  register: register
}
