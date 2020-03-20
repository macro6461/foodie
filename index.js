const readline = require("readline");
const fetch = require("node-fetch");
var apiKey = process.env.npm_package_config_apiKey;
var wifiscanner = require('node-wifiscanner')

var sortProps = [
    {name: 'price_level', high: false, initial: false, text1: '(cheapest)', textOpts: ['(cheapest)', '(most expensive)']},
    {name: 'closest', high: false, initial:false, text: ''},
    {name: 'rating', high: true, initial: true, text: '(best)', textOpts: ['(best)', '(worst)']}
]
var interval, here;


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const init = () =>{
    rl.question("What are you hungry for? ", function(food) {
        interval= kirby();
        wifiScan(food)
    });
}

const wifiScan = (food) =>{
    wifiscanner.scan(function(err, data){
        if (err) {
            console.log("Error : " + err);
            return;
        }
        return sortMacs(data, food);
    });
}

const sortMacs = (data, food) =>{
    var macs = data.sort((a,b)=>{
        if (parseInt(a.signal_level) > parseInt(b.signal_level)){
            return -1
        } else {
            return 1
        }
    }).slice(0, 3).map(x=>{
        var obj = {}
        obj['macAddress'] = x.mac 
        obj['ssid'] = x.ssid
        obj['signalLevel'] = x.signal_level
        return obj
    })

    geoFetch(macs, food)
}

const geoFetch = (macs, food) =>{
    var body = {
        "considerIp": "false",
        "wifiAccessPoints": macs
    }
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=" + apiKey, {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
        })
        .then(res=>res.json())
        .then((json,err)=>{
            if (err){
                console.log(err)
            } else {
                here = json.location;
                if (here){
                    placeSearch(here, 15, food)  
                } else {
                    console.log('Location not found. Please try again.')
                    rl.question("What are you hungry for? ", function(food) {
                        interval= kirby();
                        wifiScan(food)
                    });
                }
                placeSearch(here, 15, food)    
        }});

}

const placeSearch = (here, radius, food) => {
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + food + "&location=" + here['lat'] + "," + here['lng'] + "&radius=" + radius + "&key=" + apiKey;

    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            data.results.forEach(x=>{
                var thereA = {lat: x.geometry.location.lat, lng: x.geometry.location.lng}
                var distA = haversine(here, thereA);
                x['closest'] = distA
            })
            clearInterval(interval)
            mySort(data, 'closest')
        });
};

const renderRestaurants = (data) => {
    var newArr = data.slice();

    console.log('\n')

    if (newArr.length > 0) {
        for (var i = 0; i < newArr.length; ++i) {
            var x = newArr[i];
            if (x) {
                var rating = x.rating ? `${x.rating} (${x.user_ratings_total} reviews)` : `No Rating (${x.user_ratings_total} reviews)`;
                var price = !x.price_level || x.price_level === 0 ? 'No Price' : '';
                var distance = Math.max( Math.round(x.closest * 10) / 10).toFixed(2) + ' miles away'
                for (var y = 0; y < x.price_level; ++y) {
                    price += '$'
                }
                var line = '-----------------------------------------------------------'
                var isOpen = x.opening_hours && x.opening_hours.open_now ? 'Open' : 'Closed';
                var isLast = i !== newArr.length - 1 ? `\n${line}` : '\n\n';
                var url = formatDirectionsUrl(x.formatted_address, x.geometry.location.lat, x.geometry.location.lng, i)
                console.log(
                    `Name: ${x.name}\nAddress: ${x.formatted_address}\nRating: ${rating} | Price Rate: ${price}\nDistance: ${distance} | ${isOpen}\nDirections: ${url}\n${isLast}\n`)
            }
        }
            console.log('poop')
            console.log('Showing ' + newArr.length + ' results.')
            askSort(newArr)
    } else {
        console.log('No results found.\nPlease try to better specify your cravings.\n')
        rl.question("What are you hungry for? ", function(food) {
            interval= kirby();
            placeSearch(here, 15, food)
        });
    }
};

const mySort = (data, input) =>{

    var prop = sortProps.find(x=>x.name === input)

    var newArr = data.results ? data.results.slice() : data.slice();

    var nones = []
    var sorts = newArr;

    if (input === 'price_level'){
        nones = newArr.filter(x=>!x.price_level || x.price_level === 0)
        sorts = newArr.filter(x=>x.price_level > 0)
    } else if (input === 'rating'){
        nones= newArr.filter(x=>!x.rating)
        sorts = newArr.filter(x=>x.rating)
    }

     var sorted = sorts.sort((a, b)=>{
            if (prop.high){
                if (a[input] < b[input]){
                    return -1
                } else {
                    return 1
                }
            } else {
                if (a[input] > b[input]){
                    return -1
                } else {
                    return 1
                }
            }
        
    });

    sorted.forEach(x=>console.log(x.closest))

    sorted = nones.concat(sorted)

    prop.high = input !== 'closest' ? !prop.high : prop.high
    //reset other setProps values back to original high value
    sortProps.forEach(x=>{
        if (x.name !== prop.name){
            x.high = x.initial
        }
    })
    clearInterval(interval)
    return renderRestaurants(sorted)
}

const askSort = (newArr) =>{
    var props = sortProps.map((prop, i)=>{
            if (prop.name !== 'closest'){
                prop.text = prop.initial === prop.high ? prop.textOpts[0] :  prop.textOpts[1]
            }
        return (i===0 ? ' >' : '>') + ' ' + prop.name + ' ' + prop.text + '\n'
    }).join(' ')
        rl.question(`Sort by\n${props}\n`, function(input) {
            interval = kirby()
            var names = sortProps.map(x=>x.name)
            if (names.indexOf(input) > -1){
                return mySort(newArr, input)   
            } else {
                clearInterval(interval)
                console.log('Option not recognized.')
                return askSort(newArr)
            }
        })
}

const formatDirectionsUrl = (address, lat, lng, index) =>{
    var directionsUrl = 'https://www.google.com/maps/dir/'
    directionsUrl += here.lat + ',' + here.lng + '/' 
    + address.trim().split(' ').join('+')
    + '/' + lat + ',' + lng;
    return directionsUrl
}

const haversine = (here, there) =>{

    var lat1 = here.lat
    var lat2 = there.lat
    var lon1 = here.lng
    var lon2 = there.lng

    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
};

const toRad = (val) => {
    return val * Math.PI / 180;
};

const twirlTimer = () => {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
        process.stdout.write("\r" + P[x++]);
        x &= 3;
    }, 250);
};

const muncher = () =>{
    var P = [">:(#)", ">:|"];
    var sandwich = ['######', '#####', '####', '###', '##', '#'];
    var x = 0;
    var y = 0;
    console.log('\n')
    return setInterval(() => {
        process.stdout.clearLine();
        process.stdout.write("\r" + P[x++] + sandwich[y++]);
        x = x > 1 ? 0 : x;
        y = y > 5 ? 0 : y;
    }, 300);
};

const kirby = () =>{
    var kirby = ["<(^o^)>", "<('o')>", "<('.'<)", "(>'.')>", "<('o')>" ];
    var x = 0;
    return setInterval(() => {
        process.stdout.clearLine();
        process.stdout.write("\r" + kirby[x++]);
        x = x > 4 ? 0 : x;
    }, 500);
}


rl.on("close", function() {
    console.log('\n****REMEMBER****');
    console.log("If you're project repo is public,\nbe sure to remove you API key\nfrom the config section of your\npackage.json before you commit!");
    console.log("\nSTAY HUNGRY.");
    process.exit(0);
});

init()