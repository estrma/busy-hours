const fetch = require('axios');
async function busy_hours(place_id, key) {

    if (!(place_id && key)) {
        return {status: 'error', message: 'Place ID / API key missing'};
    }

    const gmaps = require('@google/maps').createClient({
        key: key,
        Promise: Promise
    });

    const format_output = array => {
        return {
            hour: array[0],
            percentage: array[1]
        }
    };

    const extract_data = html => {
        // ACHTUNG! HACKY AF
        let str = ['APP_INITIALIZATION_STATE=', 'window.APP_FLAGS'],
            script = html.substring(html.lastIndexOf(str[0]) + str[0].length, html.lastIndexOf(str[1]));
        // LET'S PARSE THAT MOFO
        let first = eval(script),
            second = eval(first[3][6].replace(")]}'", ""));

        return second[0][1][0][14][84];
    };

    const process_html = html => {
        const popular_times = extract_data(html);

        if (!popular_times) {
            return {status: 'error', message: 'Place has no popular hours'};
        }

        const data = {status: 'ok'};
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        const crowded_now = popular_times[7];

        if (crowded_now !== undefined) {
            data.now = format_output(crowded_now);
        }
        return data;

    };

    const fetch_html = async(url) => {
        try {
            const html = await fetch({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
                }
            });
            return html.data;
        }
        catch (err) {
            return {status: 'error', message: 'Invalid url'};
        }
    };

    try {
        const place = await gmaps.place({placeid: place_id}).asPromise();
        const result = place.json.result;
        const {name, formatted_address, geometry:{location}} = result;
        const html = await fetch_html(result.url);
        return Object.assign({name, formatted_address, location}, process_html(html));
    } catch (err) {
        return {status: 'error', message: 'Error: ' + err.json.status || err};
    }


}

module.exports = busy_hours;
