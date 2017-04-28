"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = (function () {
    function User(userInfo, socket) {
        var _this = this;
        this.socket = socket;
        this.on = function (event, fn, clear) {
            if (clear === void 0) { clear = true; }
            if (clear)
                _this.socket.removeAllListeners(event);
            _this.socket.on(event, fn);
        };
        this.emit = function (event, data) {
            if (data) {
                _this.socket.emit(event, data);
            }
            else {
                _this.socket.emit(event);
            }
        };
        this.username = userInfo.username;
        this.avatar = userInfo.avatar;
        this.money = userInfo.money;
        this.level = userInfo.level;
    }
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map