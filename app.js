var app = require('express')(),
    fs = require('fs');

var credentials = {
    key: fs.readFileSync('/root/certificados/ticademia.guiame.org.key').toString(),
    cert: fs.readFileSync('/root/certificados/ticademia.guiame.org.chained.crt').toString()
}

var http = require('https').createServer(credentials, app),
    io = require('socket.io')(http),
    mysql = require('mysql');


http.listen(9500);

//var ca = fs.readFileSync('YOUR SSL CA').toString();
//var data = fs.readFileSync('/root/certificados/ticademia.guiame.org.chained.crt').toString();


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

    console.log("A new user is connected, socket =  " + socket.id);

    //START THE SESSION
    //NOTIFY TO FRIENDS THAT I'M ONLINE
    socket.on('startChatSession', function (data) {

        if (!network[socket.id]) {
            network[socket.id] = {
                id: data.id,
                name: data.name,
                friends: {}
            };
        }

        network[socket.id].friends = data.friends;
        socket.join(data.id);
        var friendsConnected = notifyToFriends(socket, data);
        socket.emit('startChatSession', {friendsConnected: friendsConnected, items: []});
        //save the socket connection
        sockets[data.id] = socket;

    });


    //DISCONNECT THE USER
    socket.on('disconnect', function (data) {
        console.log('a user has disconnected', socket.id);
        if (!network[socket.id]) return;
        //say to all this friends, hey I have gone away!!
        for (var i in network[socket.id].friends) {
            if (sockets[i]) {
                sockets[i].emit('friendDisconnected', {id: network[socket.id].id});
            }
        }
        delete network[socket.id];
        console.log('cleaned information for the socket = ' + socket.id, network);
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

function notifyToFriends(socket, friendConnected) {
    var friendsConnected = [], friends = network[socket.id].friends;

    for (var i in friends) {
        if (sockets[i]) {
            sockets[i].emit('friendConnected', friendConnected);
            friendsConnected.push({id: i, name: friends[i]});
        }
    }
    return friendsConnected;
}











