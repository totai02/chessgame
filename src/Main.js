/**
 * Created by Administrator on 26/02/2017.
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var SocketIO = require("socket.io");
var mongoose = require("mongoose");
var Queue_1 = require("./Queue");
var mongoose_1 = require("mongoose");
var User_1 = require("./User");
var userSchema = new mongoose_1.Schema({
    username: String,
    password: String,
    winmatch: Number,
    nummatch: Number,
    level: Number
});
var User_db = mongoose.model('user', userSchema);
var Main = (function () {
    function Main() {
        var _this = this;
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = SocketIO(this.server);
        this.port = process.env.PORT || 3000;
        this.uri = 'mongodb://totai:123456@ds161410.mlab.com:61410/account_db';
        this.onConnect = function (socket) {
            socket.on("login", function (data) {
                if (_this.queue.isOnline(data.username)) {
                    socket.emit("notify", {
                        msg: "Someone is signing in to this account.",
                        evt: "LOGIN ERROR"
                    });
                }
                else {
                    _this.checkAccount(data.username, data.password).then(function (user) {
                        if (!user) {
                            socket.emit("notify", {
                                msg: "Invalid Login or password.",
                                evt: "LOGIN ERROR"
                            });
                        }
                        else {
                            socket.emit("login success");
                            _this.queue.addUser(new User_1.User(user, socket));
                        }
                    });
                }
            });
            socket.on("get user data", function (username) {
                _this.checkAccount(username).then(function (user) {
                    socket.emit("user data", user);
                });
            });
            socket.on("signup", function (data) {
                _this.createAccount(data).then(function (success) {
                    if (success) {
                        socket.emit("notify", {
                            msg: "Sign up success!",
                            evt: "SIGNUP SUCCESS"
                        });
                    }
                    else {
                        socket.emit("notify", {
                            msg: "That username is taken. Try another",
                            evt: "SIGNUP ERROR"
                        });
                    }
                });
            });
            socket.on("get user exist", function (userName) {
                _this.checkAccount(userName).then(function (user) {
                    if (user != null) {
                        socket.emit("user exist", true);
                    }
                    else {
                        socket.emit("user exist", false);
                    }
                });
            });
        };
        this.onListen = function () {
            console.log("Server created ...");
        };
        this.incNumberOfMatch = function (username) {
            User_db.findOneAndUpdate({ username: username }, { $inc: { nummatch: 1 } }, function (err, data) {
                if (err)
                    console.log("Update Error");
            });
        };
        this.incWinMatch = function (username) {
            User_db.findOneAndUpdate({ username: username }, { $inc: { winmatch: 1 } }, function (err, data) {
                if (err)
                    console.log("Update Error");
            });
        };
        this.app.use(express.static(__dirname + '/../public'));
        this.io.on('connection', this.onConnect);
        this.server.listen(this.port, this.onListen);
        this.queue = new Queue_1.Queue();
        mongoose.connect(this.uri, function (err) {
            if (err) {
                console.log(err.message);
                console.log(err);
            }
            else {
                console.log('Connected to MongoDb');
            }
        });
    }
    Main.prototype.checkAccount = function (userName, password) {
        if (password === void 0) { password = ""; }
        return new Promise(function (resolve) {
            if (password != "") {
                User_db.findOne({ username: userName, password: password }, function (err, data) {
                    if (err)
                        return console.error(err);
                    resolve(data);
                });
            }
            else {
                User_db.findOne({ username: userName }, function (err, data) {
                    if (err)
                        return console.error(err);
                    resolve(data);
                });
            }
        });
    };
    Main.prototype.createAccount = function (userInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var exist, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkAccount(userInfo.username)];
                    case 1:
                        exist = _a.sent();
                        if (exist) {
                            return [2 /*return*/, false];
                        }
                        else {
                            user = new User_db({
                                username: userInfo.username,
                                password: userInfo.password,
                                winmatch: 0,
                                nummatch: 0,
                                level: 1
                            });
                            user.save(function (err) {
                                if (err) {
                                    console.log("Error creating account!");
                                }
                            });
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Main;
}());
exports.main = new Main();
//# sourceMappingURL=Main.js.map