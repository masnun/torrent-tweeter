"use strict";

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _configs = require("./configs");

var _configs2 = _interopRequireDefault(_configs);

var _utils = require("./utils");

var _cheerio = require("cheerio");

var _cheerio2 = _interopRequireDefault(_cheerio);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _twitter = require("twitter");

var _twitter2 = _interopRequireDefault(_twitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("babel-polyfill");

pollKAT();
// Poll Kick Ass Torrent every 5 mins
setInterval(pollKAT, 5 * 60 * 1000);

// We poll KAT and send tweets
function pollKAT() {
    var pattern_regex, tv_series_data, body, $, stored_data_json, stored_data, notifications, json_to_store;
    return regeneratorRuntime.async(function pollKAT$(_context) {
        while (1) switch (_context.prev = _context.next) {
            case 0:

                // Regular expression to match common TV series
                // Group - 1: Title
                // Group - 2: Series
                // Group -3: Episode

                pattern_regex = /(.*) s([0-9]{2})e([0-9]{2})/i;
                tv_series_data = {};
                _context.prev = 2;
                _context.next = 5;
                return regeneratorRuntime.awrap((0, _utils.getKatHTML)());

            case 5:
                body = _context.sent;
                _context.next = 11;
                break;

            case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](2);

                console.log("Error:" + _context.t0);

            case 11:

                //Use cheerio to select the links and extract data
                $ = _cheerio2.default.load(body);

                $("a.cellMainLink").each(function () {

                    var title = $(this).text();
                    var data = pattern_regex.exec(title);
                    if (data) {
                        (function () {
                            var show_name = data[1];
                            var series = data[2];
                            var episode = data[3];

                            // Iterate over the series we care about and get only the latest version
                            // We want to tweet only the latest version to minimize tweets
                            _configs2.default.series.forEach(function (title) {
                                if (show_name.indexOf(title) > -1) {
                                    if (tv_series_data[title] == undefined) {
                                        tv_series_data[title] = { "series": series, "episode": episode };
                                    } else {
                                        var existing_entry = tv_series_data[title];
                                        if (series > existing_entry['series'] || episode > existing_entry['episode']) {
                                            tv_series_data[title] = { "series": series, "episode": episode };
                                        }
                                    }
                                }
                            });
                        })();
                    }
                });

                // Read the stored data and get JS dict
                stored_data_json = _fs2.default.readFileSync("data.json");
                stored_data = JSON.parse(stored_data_json);
                notifications = [];

                _configs2.default.series.forEach(function (title) {
                    var existing_entry = stored_data[title];
                    var new_entry = tv_series_data[title];

                    // See if a new series is available
                    if (new_entry) {

                        // If entry exists, and we find newer ones, overwrite older one
                        if (existing_entry) {
                            if (new_entry['series'] > existing_entry['series'] || new_entry['episode'] > existing_entry['episode']) {
                                stored_data[title] = { "series": new_entry['series'], "episode": new_entry['episode'] };
                                notifications.push(title + " Series: " + new_entry['series'] + " Episdoe: " + new_entry['episode'] + " is out!");
                            }
                        } else {
                            // This is the first time we came across this TV show, write new entry
                            stored_data[title] = { "series": new_entry['series'], "episode": new_entry['episode'] };
                            notifications.push(title + " S: " + new_entry['series'] + " E: " + new_entry['episode'] + " is out!");
                        }
                    }
                });

                // Store the new series data
                json_to_store = JSON.stringify(stored_data);

                _fs2.default.writeFileSync("data.json", json_to_store);

                // Do we have notifications to send? Send 'em!
                if (notifications.length > 0) {
                    (function () {
                        var twitter_client = (0, _twitter2.default)(_configs2.default.twitter);
                        notifications.forEach(function (msg) {
                            twitter_client.post('statuses/update', { status: 'Hey @masnun ' + msg }, function (error, tweet, response) {
                                if (error) {
                                    throw error;
                                } else {
                                    console.log('Tweet posted: ' + msg);
                                }
                            });
                        });
                    })();
                } else {
                    console.log("No new notifications!");
                }

            case 20:
            case "end":
                return _context.stop();
        }
    }, null, this, [[2, 8]]);
}
