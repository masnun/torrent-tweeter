require("babel-polyfill");

import request from "request"
import configs from "./configs"
import {getKatHTML} from "./utils"
import cheerio from "cheerio"
import fs from "fs"
import Twitter from "twitter"


pollKAT();
// Poll Kick Ass Torrent every 5 mins
setInterval(pollKAT, (5 * 60 * 1000));

// We poll KAT and send tweets
async function pollKAT() {

    // Regular expression to match common TV series
    // Group - 1: Title
    // Group - 2: Series
    // Group -3: Episode

    const pattern_regex = /(.*) s([0-9]{2})e([0-9]{2})/i;
    let tv_series_data = {};

    try {
        var body = await getKatHTML();
    } catch (e) {
        console.log("Error:" + e);
    }

    //Use cheerio to select the links and extract data
    const $ = cheerio.load(body);
    $("a.cellMainLink").each(function () {

        let title = $(this).text();
        let data = pattern_regex.exec(title);
        if (data) {
            let show_name = data[1];
            let series = data[2];
            let episode = data[3];

            // Iterate over the series we care about and get only the latest version
            // We want to tweet only the latest version to minimize tweets
            configs.series.forEach(function (title) {
                if (show_name.indexOf(title) > -1) {
                    if (tv_series_data[title] == undefined) {
                        tv_series_data[title] = {"series": series, "episode": episode}
                    } else {
                        let existing_entry = tv_series_data[title];
                        if (series > existing_entry['series'] || episode > existing_entry['episode']) {
                            tv_series_data[title] = {"series": series, "episode": episode}
                        }

                    }

                }
            });
        }

    });

    // Read the stored data and get JS dict
    let stored_data_json = fs.readFileSync("data.json");
    let stored_data = JSON.parse(stored_data_json);
    let notifications = [];

    configs.series.forEach(function (title) {
        let existing_entry = stored_data[title];
        let new_entry = tv_series_data[title];

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
    const json_to_store = JSON.stringify(stored_data);
    fs.writeFileSync("data.json", json_to_store);

    // Do we have notifications to send? Send 'em!
    if (notifications.length > 0) {
        const twitter_client = Twitter(configs.twitter);
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


}

