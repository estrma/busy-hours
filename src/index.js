const fetch = require('axios');

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function busy_hours(place_id, key) {

    let gmaps = require('@google/maps').createClient({
        key: key,
        Promise: Promise
    });

    let format_output = array => {
        return {
            hour: array[0],
            percentage: array[1]
        }
    };

    let extract_data = html => {
        // ACHTUNG! HACKY AF
        let str = ['APP_INITIALIZATION_STATE=', 'window.APP_FLAGS'],
            script = html.substring(html.lastIndexOf(str[0]) + str[0].length, html.lastIndexOf(str[1]));
        // LET'S PARSE THAT MOFO
        let first = eval(script),
            second = eval(first[3][6].replace(")]}'", ""));

        return second[0][1][0][14][84];
    };

    let process_html = resp => {

        if (resp.data) {

            let popular_times = extract_data(resp.data);

            if (popular_times === null) {
                return {status: 'error', message: 'Place has no popular hours'};
            }

            let data = {status: 'ok'};

            data.week = Array.from(Array(7).keys()).map(index => {
                let hours = [];
                if (popular_times[0][index] && popular_times[0][index][1]) {
                    hours = Array.from(popular_times[0][index][1]).map(array => format_output(array));
                }
                return {
                    day: weekdays[index],
                    hours: hours
                };

            });
            let crowded_now = popular_times[7];

            if (crowded_now !== undefined) {
                data.now = format_output(crowded_now);
            }
            return data;
        } else {
            return {status: 'error'};
        }
    };

    let fetch_html = resp => {
        let url = resp.json.result.url;
        if (url) {
            return fetch({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
                }
            });
        } else {
            return {status: 'error', message: 'Invalid url'};
        }
    };

    let handle_err = err => {
        return {status: 'error', message: err}
    };

    let new_promise = gmaps.place({placeid: place_id}, handle_err)
        .asPromise()
        .then(fetch_html)
        .then(process_html);

    return new_promise;
}

module.exports = busy_hours;
