var dgram = require('dgram');

var socket = dgram.createSocket({ type: 'udp4', reuseAddr: true }, debug);
socket.on('*', debug("Everything"));
socket.on('error', debug("Error"));
socket.on('listening', debug("Listening"));
socket.on('message', function(msg, address) {
  console.log("Message received: %s", msg);
  socket.close();
});

socket.bind(port, '0.0.0.0', function() {
  socket.setBroadcast(true);
  console.log("Successfully bound to port %d", port);

  var message = new Buffer("1,@?v");
  socket.send(message, 0, message.length, 9760, "255.255.255.255", debug("Send"));
});