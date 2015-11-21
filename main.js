var request = require("request");
var configs = require("./configs");
var cheerio = require('cheerio');
var fs = require("fs");
var Twitter = require('twitter');

pollKAT();
// Poll Kick Ass Torrent every 5 mins
setInterval(pollKAT, (5 * 60 * 1000));

// We poll KAT and send tweets
function pollKAT() {

    // Regular expression to match common TV series
    // Group - 1: Title
    // Group - 2: Series
    // Group -3: Episode

    var pattern_regex = /(.*) s([0-9]{2})e([0-9]{2})/i;
    var tv_series_data = {};

    request({uri: 'https://kat.cr/tv/', gzip: true, method: "GET"}, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            //Use cheerio to select the links and extract data
            var $ = cheerio.load(body);
            $("a.cellMainLink").each(function () {

                var title = $(this).text();
                var data = pattern_regex.exec(title);
                if (data) {
                    var show_name = data[1];
                    var series = data[2];
                    var episode = data[3];

                    // Iterate over the series we care about and get only the latest version
                    // We want to tweet only the latest version to minimize tweets
                    configs.series.forEach(function (title) {
                        if (show_name.indexOf(title) > -1) {
                            if (tv_series_data[title] == undefined) {
                                tv_series_data[title] = {"series": series, "episode": episode}
                            } else {
                                var existing_entry = tv_series_data[title];
                                if (series > existing_entry['series'] || episode > existing_entry['episode']) {
                                    tv_series_data[title] = {"series": series, "episode": episode}
                                }

                            }

                        }
                    });
                }

            });

            // Read the stored data and get JS dict
            var stored_data_json = fs.readFileSync("data.json");
            var stored_data = JSON.parse(stored_data_json);
            var notifications = [];

            configs.series.forEach(function (title) {
                var existing_entry = stored_data[title];
                var new_entry = tv_series_data[title];

                // See if a new series is available
                if (new_entry) {

                    // If entry exists, and we find newer ones, overwrite older one
                    if (existing_entry) {
                        if (new_entry['series'] > existing_entry['series'] || new_entry['episode'] > existing_entry['episode']) {
                            stored_data[title] = {"series": new_entry['series'], "episode": new_entry['episode']};
                            notifications.push(title + " Series: " + new_entry['series'] + " Episdoe: " + new_entry['episode'] + " is out!")
                        }
                    } else {
                        // This is the first time we came across this TV show, write new entry
                        stored_data[title] = {"series": new_entry['series'], "episode": new_entry['episode']};
                        notifications.push(title + " S: " + new_entry['series'] + " E: " + new_entry['episode'] + " is out!")
                    }
                }
            });

            // Store the new series data
            var json_to_store = JSON.stringify(stored_data);
            fs.writeFileSync("data.json", json_to_store);

            // Do we have notifications to send? Send 'em!
            if (notifications.length > 0) {
                var twitter_client = Twitter(configs.twitter);
                notifications.forEach(function (msg) {
                    twitter_client.post('statuses/update', {status: 'Hey @masnun ' + msg}, function (error, tweet, response) {
                        if (error) {
                            throw error
                        } else {
                            console.log('Tweet posted: ' + msg);
                        }


                    });
                })
            } else {
                console.log("No new notifications!");
            }

        } else {
            console.log("Error reading KAT HTML!");
        }
    });


}

