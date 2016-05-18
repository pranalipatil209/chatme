var express = require('express')
  ,app = express()
  ,multer = require('multer')
  ,server = require('http').createServer(app)
  ,io = require('socket.io').listen(server);
  users = {};
  connections = [];

server.listen(process.env.PORT || 3001);
console.log('Server started..');

//image storage

// var storage	=	multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, './uploads');
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.originalname);
//     }
// });
// var upload = multer({ storage : storage}).single('userPhoto');

app.get('/',function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

// app.post(function(req,res){
//     upload(req,res,function(err) {
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.end();
//     });
// });


// io.sockets.on('connection', function(socket){
//   connections.push(socket);
//   console.log('Connected : %s socket/s connected',connections.length);
//
//   //disconnect
//   socket.on('disconnect',function(data){
//
//     users.splice(users.indexOf(socket.userName),1);
//     updateUsernames();
//     connections.splice(connections.indexOf(socket),1)
//     console.log('Disconnected: %s socket disconnectd',connections.length);
//   });
//
//   //send messages
//   socket.on('send message',function(data){
//
//     io.sockets.emit('new message',{msg:data,user:socket.userName});
//   });
//
//   //new user
//   socket.on('new user',function(data,callback){
//     callback(true);
//     socket.userName = data;
//     users.push(socket.userName);
//     updateUsernames();
//   });
//
//   function updateUsernames(){
//     // console.log(users);
//     io.sockets.emit('get users',users);
//   }
// });

io.on('connection', function (client) {
  console.log('connected');

  client.on('new user', function (data, callback) {
    if (data in users) {
      callback(false);
    } else {
      console.log(data);
      callback(true);
      client.userName = data;
      users[client.userName] = client;
      updateUser();
  }
});

function updateUser() {

  client.emit('get users', Object.keys(users));
  client.broadcast.emit('get users', Object.keys(users));
}

client.on('send message', function (data, callback) {
  var msg = data.trim();
  if (msg.substr(0, 3) === '/w ') {
    msg = msg.substring(3);
    var ind = msg.indexOf(' ');
    if (ind !== -1) {
      var name = msg.substring(0, ind);
      var msg = msg.substring(ind + 1);
      if (name in users) {
        users[name].emit('whisper', {msg:msg,user:client.userName});
        console.log(client.userName+': (whispered) '+msg);
    }
    else {
      callback('Error! Enter a valid user!')
    }
  }
     else {
    callback('Error! Please enter your message');
    }
  }
    else {
      client.emit('new message', {msg:msg,user:client.userName});
      client.broadcast.emit('new message', {msg:msg,user:client.userName});
      }
});

  client.on('disconnect', function (data) {
  if (!client.userName) return;
  console.log('users :' + client.userName + ' left');
  delete users[client.userName];
  updateUser();
});
});
