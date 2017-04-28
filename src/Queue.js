"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Room_1 = require("./Room");
var Queue = (function () {
    function Queue() {
        var _this = this;
        this.addUser = function (user) {
            _this.users.push(user);
            _this.initPlayerEvent(user);
        };
        this.isOnline = function (userName) {
            for (var i = 0; i < _this.users.length; i++) {
                if (_this.users[i].username == userName)
                    return true;
            }
            return false;
        };
        this.initPlayerEvent = function (user) {
            user.on("get room list", function () {
                user.emit("room list", _this.getRoomList());
            });
            user.on("join room", function (roomID) {
                var findRoom = false;
                for (var i = 0; i < _this.rooms.length; i++) {
                    if (_this.rooms[i].id == roomID) {
                        findRoom = true;
                        if (!_this.rooms[i].addUser(user)) {
                            user.emit("room full");
                        }
                        break;
                    }
                }
                if (!findRoom)
                    user.emit("cannot find room");
            });
            user.on("broadcast message", function (msg) {
                user.emit("new broadcast message", { playername: user.username, message: msg });
                user.socket.broadcast.emit("new broadcast message", { playername: user.username, message: msg });
            });
            user.on("disconnect", function () {
                var index = _this.users.findIndex(function (element) {
                    return element == user;
                });
                _this.users.splice(index, 1);
            }, false);
        };
        this.getRoomList = function () {
            var k = 1;
            var roomArr = [];
            for (var i = 0; i < 20; i++) {
                var done = false;
                while (_this.rooms[k].isFull()) {
                    k++;
                    if (k >= _this.rooms.length) {
                        done = true;
                        break;
                    }
                }
                if (!done) {
                    roomArr.push({
                        id: _this.rooms[k].id,
                        name: _this.rooms[k].name,
                        stake: _this.rooms[k].stake,
                        playerNumber: _this.rooms[k].users.length
                    });
                    k++;
                }
                else
                    break;
            }
            return roomArr;
        };
        this.users = [];
        this.rooms = [];
        for (var i = 0; i < 50; i++) {
            this.rooms.push(new Room_1.Room(i, "Room " + i));
        }
    }
    return Queue;
}());
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map