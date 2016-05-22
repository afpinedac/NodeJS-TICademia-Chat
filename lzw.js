var mysql = require('mysql');
var LZWAsync = require('lzw-async');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ticademia'
});


var useLZW = true;
var numberOfRecords = 1000;


for (var i = 0; i < numberOfRecords; i++) {

    if (!useLZW) {
        var msg = {
            from: 1,
            to: 2,
            message: randomString(600)
        };
        connection.query("INSERT INTO chats SET ?", msg);
    } else {
        LZWAsync.compress({
            input: randomString(600),
            output: function (output) {
                console.log(output);
                var msg = {
                    from: 1,
                    to: 2,
                    message: output
                };
                connection.query("INSERT INTO chats SET ?", msg);
            }
        });
    }


}

//process.exit();


function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
