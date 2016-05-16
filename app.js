var express = require('express')
  ,app = express()
  ,server = require('http').createServer(app)
  ,io = require('socket.io').listen(server);
  users = [];
  connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server started..');

app.get('/',function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected : %s socket/s connected',connections.length);

  //disconnect
  socket.on('disconnect',function(data){

    users.splice(users.indexOf(socket.userName),1);
    updateUsernames();
    connections.splice(connections.indexOf(socket),1)
    console.log('Disconnected: %s socket disconnectd',connections.length);
  });

  //send messages
  socket.on('send message',function(data){

    io.sockets.emit('new message',{msg:data,user:socket.userName});
  });

  //new user
  socket.on('new user',function(data,callback){
    callback(true);
    socket.userName = data;
    users.push(socket.userName);
    updateUsernames();
  });

  function updateUsernames(){
    // console.log(users);
    io.sockets.emit('get users',users);
  }
});
