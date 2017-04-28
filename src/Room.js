/**
 * Created by Administrator on 26/02/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1 = require("./Main");
var Room = (function () {
    function Room(id, name) {
        var _this = this;
        this.users = [];
        this.turnColor = true;
        this.player0accept = false;
        this.player1accept = false;
        this.stake = 0;
        this.addUser = function (user) {
            if (_this.users.length == 2)
                return false;
            _this.users.push(user);
            user.socket.emit("join room success");
            user.socket.once("room status", function () {
                if (_this.users.length == 1) {
                    _this.users[0].socket.emit("wait player");
                    _this.users[0].on("disconnect", _this.onUser0Left, false);
                    _this.users[0].on("left room", _this.onUser0Left);
                }
                else if (_this.users.length == 2) {
                    _this.users[1].on("disconnect", _this.onUser1Left, false);
                    _this.users[1].on("left room", _this.onUser1Left);
                    _this.startgame();
                }
            });
            return true;
        };
        this.onUser0Left = function () {
            if (_this.users.length == 1) {
                _this.users = [];
            }
            else if (_this.users.length == 2) {
                _this.users.splice(0, 1);
                _this.users[0].socket.emit("user left");
                Main_1.main.incWinMatch(_this.users[0].username);
            }
        };
        this.onUser1Left = function () {
            if (_this.users.length == 1) {
                _this.users = [];
            }
            else if (_this.users.length == 2) {
                _this.users.splice(1, 1);
                _this.users[0].socket.emit("user left");
                Main_1.main.incWinMatch(_this.users[0].username);
            }
        };
        this.startgame = function () {
            Main_1.main.incNumberOfMatch(_this.users[0].username);
            Main_1.main.incNumberOfMatch(_this.users[1].username);
            _this.player0accept = false;
            _this.player1accept = false;
            _this.turnColor = true;
            _this.users[0].socket.emit("start game", { color: true, oppname: _this.users[1].username });
            _this.users[1].socket.emit("start game", { color: false, oppname: _this.users[0].username });
            var _loop_1 = function (i) {
                _this.users[i].on("move", function (data) {
                    _this.users[1 - i].socket.emit("opponent move", data);
                    _this.turnColor = !_this.turnColor;
                    _this.users[0].socket.emit("turn color", _this.turnColor);
                    _this.users[1].socket.emit("turn color", _this.turnColor);
                });
                _this.users[i].on("promotion", function (data) {
                    _this.users[1 - i].socket.emit("opponent promotion", data);
                    _this.turnColor = !_this.turnColor;
                    _this.users[0].socket.emit("turn color", _this.turnColor);
                    _this.users[1].socket.emit("turn color", _this.turnColor);
                });
                _this.users[i].on("restart", function () {
                    if (i == 0)
                        _this.player0accept = true;
                    else
                        _this.player1accept = true;
                    if (_this.player1accept && _this.player0accept) {
                        _this.users[0].socket.emit("restart game");
                        _this.users[1].socket.emit("restart game");
                    }
                });
                _this.users[i].on("game finish", function () {
                    _this.users[1 - i].socket.emit("finish");
                });
                _this.users[i].on("left", function () {
                    Main_1.main.incWinMatch(_this.users[1 - i].username);
                    _this.users[1 - i].socket.emit("player left");
                    _this.users.splice(i, 1);
                });
                _this.users[i].on("send message", function (msg) {
                    _this.users[i].socket.emit("new message", { playername: _this.users[i].username, message: msg });
                    _this.users[1 - i].socket.emit("new message", { playername: _this.users[i].username, message: msg });
                });
                _this.users[i].on("time out", function () {
                    Main_1.main.incWinMatch(_this.users[1 - i].username);
                    _this.users[1 - i].socket.emit("opponent timeout");
                });
            };
            for (var i = 0; i < 2; i++) {
                _loop_1(i);
            }
        };
        this.isFull = function () {
            if (_this.users.length >= 2) {
                return true;
            }
            return false;
        };
        this.id = id;
        this.name = name;
    }
    return Room;
}());
exports.Room = Room;
//# sourceMappingURL=Room.js.map