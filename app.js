var io = require('socket.io').listen(8888),
    mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ticademia'
});

var sessions = [];
connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});


var network = {}, sockets = {};

// io.sockets.in(data.room).emit('newMessage', {from: data.from, message: data.message});
//io.sockets.emit('availables', io.sockets.adapter.rooms);

io.sockets.on('connection', function (socket) {


    //START THE SESSION
    //NOTIFY TO FRIENDS THAT I'M ONLINE
    socket.on('startChatSession', function (data) {

        if(!network[data.id]){
            network[data.id] = {};
            network[data.id]['name'] = data.name;
            network[data.id]['friends'] = {};
        }

        network[data.id]['friends'] = data.friends;
        socket.join(data.id);
        var friendsConnected = notifyToFriends( data);
        socket.emit('startChatSession', {friendsConnected: friendsConnected});
        console.log(network);

        //save the socket connection
        sockets[data.id] = socket;

    });


    //DISCONNECT THE USER
    socket.on('disconnect', function (data) {
        console.log(data);
        //io.sockets.emit('availables', io.sockets.adapter.rooms);
        delete network[data.id];
        console.log('cleaned information for the user');
    });

    //SEND A MESSAGE TO ANOTHER USER
    socket.on('sendChat', function (data) {

        if (data.from && data.to && data.message) {

            data.date = new Date().getTime();
            data.received = 1;


            var response = {};
            response.items = [{
                m: data.message,
                f: data.from,
                s: 0                    //0=the other user sent a message, 2, when I sent the data
            }];

            var sent = io.sockets.in(data.to).emit('sendChat', response);

            if (!sent) {
                msg['received'] = 0;
            }

            //connection.query("INSERT INTO chats SET ?", msg);

        }

    });

});

function notifyToFriends(friendConnected) {
    var friendsConnected = [], friends = network[friendConnected.id]['friends'];

    for (var i in friends) {
        if(!sockets[i]){
            continue;
        }else{
            sockets[i].emit('friendConnected', friendConnected);
            friendsConnected.push({id: i, name: friends[i]});
        }

    }
    return friendsConnected;
}











