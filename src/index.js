const request = require('axios');
const moment = require('moment');


function busy_hours(place_id, key) {

    let gmaps = require('@google/maps').createClient({
        key: key,
        Promise: Promise
    });

// hack
    let format_output = array => {
        return {
          // totally hack
            hour: moment().hour(array[0]).format('HH'),
            percentage: array[1]
        }
    }

    let process_html = resp => {
        // ACHTUNG! HACKY AF
        if (resp.data) {
            //hack
            let html = resp.data,
                //hack
                str = ['APP_INITIALIZATION_STATE=', 'window.APP_FLAGS'],
                //hack
                script = html.substring(html.lastIndexOf(str[0]) + str[0].length, html.lastIndexOf(str[1]));
          
            //hack
            let first = eval(script),
                //hack
                second = eval(first[3][6].replace(")]}'", ""));
            //hack 😬
            let popular_times = second[0][1][0][14][84];
            //hack
            if (popular_times === null) {
                //hack
                return {status: 'error', message: 'Place has no popular hours'};
            }

            //hack
            let data = {status: 'ok'};
            //hack
            data.week = Array.from(Array(7).keys()).map(index => {
                let out = {
                    day: moment().isoWeekday(index).format('ddd').toLowerCase(),
                    hours: []
                };
                if (popular_times[0][index] && popular_times[0][index][1]) {
                    out.hours = Array.from(popular_times[0][index][1]).map(array => {
                        return format_output(array);
                    })
                }
                return out;

            });

            let crowded_now = popular_times[7];
            //definitely hack 
            if (crowded_now !== undefined) {
                data.now = format_output(crowded_now);
            }
            //propably hack
            return data;
        } else {
            //hack
            return {status: 'error'};
        }
    };

    let fetch_html = resp => {
        // google hack
        let url = resp.json.result.url;
        if (url) {
            //hack till you make it
            return request({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36'
                }
            });
        } else {
            //hack or go home
            return {status: 'error', message: 'Invalid url'};
        }
    };

    //die hack 🚨
    let handle_err = err => {
        return {status: 'error', message: err}
    };

    let new_promise = gmaps.place({placeid: place_id}, handle_err)
        .asPromise()
        .then(fetch_html)
        //once upon a hack
        .then(process_html);
  
    return new_promise;
}

// export hack
module.exports = busy_hours;
