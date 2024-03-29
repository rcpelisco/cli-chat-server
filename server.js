let app = require("express")();
let http = require("http").Server(app);
let io = require("socket.io")(http);

let port = process.env.PORT || 8080

app.get("/", function(req, res) {
  res.send("CLI Chat Server!");
});

let connectedUsers = {};
let rooms = [];

io.on("connection", function(socket) {
  socket.on("new user", function(data, callback) {
    if (data in connectedUsers) {
      callback(false);
    } else {
      callback(true);
      console.log(data);
      socket.user = data;
      connectedUsers[socket.user] = socket;
    }
  });
  socket.on("message", function(body) {
    console.log(socket.id);
    let message = {
      body: body,
      sender: socket.user
    };
    io.sockets.emit("new message", message);
  });
  socket.on("new room", function(room, callback) {
    if (rooms.indexOf(room) != -1) {
      callback(false);
      console.log("Room already exists!");
    } else {
      callback(true);
      rooms.push(room);
      console.log("Room created");
      console.log("new room: " + room);
    }
  });
  socket.on("list room", function(message, callback) {
    callback(rooms);
  });
  socket.on("disconnect", function(data) {
    if (!socket.user) return;
    delete connectedUsers[socket.user];
  });
});

http.listen(port, function() {
  console.log("App running");
});
