'use strict';

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var request = require('axios');
var cheerio = require('cheerio');
var moment = require('moment');

function busy_hours(place_id, key) {

    var gmaps = require('@google/maps').createClient({
        key: key,
        Promise: _Promise
    });

    var format_output = function format_output(array) {
        return {
            hour: moment().hour(array[0]).format('HH'),
            percentage: array[1]
        };
    };

    var process_html = function process_html(resp) {
        // Achtung! Hacky AF

        if (resp) {
            var html = resp.data,
                script = html.substring(html.lastIndexOf("APP_INITIALIZATION_STATE=") + 1, html.lastIndexOf("window.APP_FLAGS"));

            var first = eval(script),
                second = eval(first[3][6].replace(")]}'", ""));

            var popular_times = second[0][1][0][14][84];

            var data = {};

            data.week = Array.from(Array(7).keys()).map(function (index) {
                return {
                    day: moment().isoWeekday(index).format('ddd').toLowerCase(),
                    hours: Array.from(popular_times[0][index][1]).map(function (array) {
                        return format_output(array);
                    })
                };
            });

            var crowded_now = popular_times[7];

            if (crowded_now !== undefined) {
                data.now = format_output(crowded_now);
            }

            return data;
        }
    };

    var fetch_html = function fetch_html(resp) {

        var json = resp.json;

        if (json.result) {

            return request({
                url: json.result.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
                }
            });
        }
    };

    var handle_err = function handle_err(err) {
        console.log(err);
    };

    var new_promise = gmaps.place({ placeid: place_id, language: 'pl' }).asPromise().then(fetch_html).catch(handle_err).then(process_html).catch(handle_err);

    return new _Promise(function (resolve, reject) {
        resolve(new_promise);
    });
}

module.exports = busy_hours;