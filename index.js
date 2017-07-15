const request = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');


function busy_hours(place_id, key) {


    let gmaps = require('@google/maps').createClient({
        key: key,
        Promise: Promise
    });

    let format = h => {
        return {
            hour: moment().hour(h[0]).format('HH'),
            percentage: h[1]
        }
    }

    let process_html = resp => {
        // Achtung! Hacky AF

        if (resp) {
            let html = resp.data,
                script = html.substring(html.lastIndexOf("APP_INITIALIZATION_STATE=") + 1, html.lastIndexOf("window.APP_FLAGS"));

            let first = eval(script),
                second = eval(first[3][6].replace(")]}'", ""));

            let popular_times = second[0][1][0][14][84]; // week


            let data = {};

            data.week = Array.from(Array(7).keys()).map(index => {
                return {
                    day: moment().isoWeekday(index).format('ddd'),
                    hours: Array.from(popular_times[0][index][1]).map(h => {
                        return format(h);
                    })
                }

            });

            let crowded_now = popular_times[7];
            if (crowded_now !== undefined) {
                data.now = format(crowded_now);
            }

            return data;
        }
    };

    let fetch_html = resp => {

        let json = resp.json;

        if (json.result) {

            return request({
                url: json.result.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
                }
            });
        }


    };

    let handle_err = err => {
        console.log(err);
    };

    let P = gmaps.place({placeid: place_id, language: 'pl'})
        .asPromise()
        .then(fetch_html)
        .catch(handle_err)
        .then(process_html)
        .catch(handle_err);

    return new Promise((resolve, reject) => {
        resolve(P);
    });

}

// const get_hours = busy_hours(place_id, key);
//
// get_hours.then(data => {
//     console.log(data)
// });


export default busy_hours;