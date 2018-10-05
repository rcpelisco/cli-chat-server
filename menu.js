const Vorpal = require("vorpal");
const chalk = Vorpal().chalk;
const io = require("socket.io-client");
const socket = io.connect("http://localhost:5000");
const menu = Vorpal().delimiter(`${chalk.green("anonymous@chatting-app")}\n$`);

menu.command("login <username>", "Logs the user in").action(function(args, callback) {
  var self = this;
  // var promise = this.prompt([
  //   {
  //     type: "input",
  //     name: "username",
  //     message: "Username: "
  //   }
    // {
    //   type: "password",
    //   name: "password",
    //   message: "Password: "
    // }
  // ]);

  // promise.then(function(answers) {
    process.stdout.write("\u001B[2J\u001B[0;0f");
    initChat(args.username);
    callback();
  // });
});

menu
  .command("message <message...>", "Sends a message to all connected users")
  .action(function(args, callback) {
    let message = args.message.join(" ");
    this.log(message);
    socket.emit("message", message);
    callback();
  });

menu
  .command("room")
  .option("-c, --create <name>", "Creates a room")
  .option("-l, --list", "List all rooms")
  .action(function(args, callback) {
    const self = this;
    if (args.options.list) {
      socket.emit("list room", null, function(responses) {
        if (responses.length < 1) {
          self.log("No rooms are found!");
        } else {
          self.log("Available rooms: ");
          responses.forEach(response => {
            self.log(response);
          });
        }
        callback();
      });
    } else {
      socket.emit("new room", args.options.create, function(response) {
        if (!response) {
          self.log("Room already exists!");
        } else {
          self.log("Room created!");
        }
      });
    }
    callback();
  });

function initChat(username) {
  socket.emit("new user", username, function(data) {
    if (!data) {
      chat.log(chalk.red("User already exists"));
    } else {
      chat.log(chalk.yellow("Welcome to chat app"));
    }
  });
  chat.delimiter(`${chalk.green(username + "@chatting-app")}\n$`).show();
}

const chat = Vorpal();

chat
  .command("message <message...>", "Sends a message to all connected users")
  .action(function(args, callback) {
    let message = args.message.join(" ");
    socket.emit("message", message);
    callback();
  });

menu.show();

socket.on("new message", function(message) {
  chat.log(
    `${message.sender == undefined ? "anonymous" : message.sender}: ${message.body}`
  );
});

socket.on("update users", function(users) {
  console.log("Connected users: " + users);
});
