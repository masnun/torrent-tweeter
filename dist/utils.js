"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getKatHTML = getKatHTML;

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getKatHTML() {
    return regeneratorRuntime.async(function getKatHTML$(_context) {
        while (1) switch (_context.prev = _context.next) {
            case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                    (0, _request2.default)({ uri: 'https://kat.cr/tv/', gzip: true, method: "GET" }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                }));

            case 1:
            case "end":
                return _context.stop();
        }
    }, null, this);
}
