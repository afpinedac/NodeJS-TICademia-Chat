$(document).ready(function () {

    var TC = TC || {};

    TC.chat = (function () {

        var socket,
            username,
            usersConnected = [];


        var _init = function () {
            socket = io.connect('http://localhost:8888');
            username = prompt('Enter username');
            $("#username").text(username);

            socket.emit('join', {username: username});
            socket.emit('availables');
            socket.on('newMessage', function (data) {
                $("#messages").append("<p> Mensaje de : " + data.from + " = " + data.message + "</p>");

            });

            socket.on('availables', function (data) {

                $("#availables").empty();
                usersConnected = [];
                for (var i in data) {
                    $("#availables").append("<li>" + i + "</li>");
                    usersConnected.push(i);
                }

                restartChatWindow();
            });
        }

        var getUsersAvailables = function () {
            socket.emit('availables');
        }


        $("#chat-send").on('click', function () {
            var to = $("#chat-to").data('to'),
                message = $("#chat-message").text();


            socket.emit('newMessage', {to: to, msg: message});
        });

        var restartChatWindow = function () {
            var chat = $("#chat-to");
            chat.empty();
            for (var i in usersConnected) {
                chat.append("<option value='" + usersConnected[i] + "'>" + usersConnected[i] + "</option>");
            }
        }

        $("#chat-send").on('click', function () {
            var to = $("#chat-to").val(),
                message = $("#chat-message").val().trim();
            socket.emit('newMessage', {room: to, message: message, from: username});
        });

        return {
            init: _init(),
            uc: usersConnected
        }


    })();

    //TC.chat.init();


});






