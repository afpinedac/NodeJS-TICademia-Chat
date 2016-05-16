
var io = require('socket.io').listen(8888),
    mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ticademia'
});

connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});

io.sockets.on('connection', function(socket){

    socket.on('join',  function(data){
        socket.join(data.username);
    });

    socket.on('availables', function(){
        console.log('alguien solicitó availables');
        io.sockets.emit('availables', io.sockets.adapter.rooms);
    });


    socket.on('newMessage', function(data){

        if(data.from && data.room && data.message){
            var msg  = {
                from: data.from,
                to: data.room,
                message : data.message
            };
            connection.query("INSERT INTO chats SET ?", msg, function(err, result){
            });
        }

        io.sockets.in(data.room).emit('newMessage', {from: data.from , message:data.message});
    });

    socket.on('disconnect', function(){
        io.sockets.emit('availables', io.sockets.adapter.rooms);
    });
});





