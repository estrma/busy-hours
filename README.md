## busy-hours 
Barbaric node.js scraper for Google Places popular times data. 

#### Installation
```javascript
$ npm i busy-hours --save
```
#### Usage
* Get your [API key](https://developers.google.com/places/web-service/)
* Retrieve the [Place ID](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)

```javascript
const busy_hours = require('busy_hours');

const get_hours = busy_hours(place_id, key);

get_hours.then(data => {
    do_something_with(data); 
 });
```
Response

```javascript
{
    week: [
    {
        day: 'mon',
        hours: [
            { 
              hour: '06',
              percentage: 21,
            }, { 
              hour: '07',
              percentage: 37,
            } ...
        ]} ...
    ],
    now: { 
        hour: '12',
        percentage: 30,
      }
}

```



#### Achtung!


Using this code may violate clause 10.1(b) of [Google ToS](https://developers.google.com/maps/terms?#section_10_1), so beware.

>No access to APIs or Content except through the Service. You will not access the Maps API(s) or the Content except through the Service. For example, you must not access map tiles or imagery through interfaces or channels (including undocumented Google interfaces) other than the Maps API(s).
>

