const fetch = require("node-fetch");
var wifiscanner = require('node-wifiscanner')

const getMacAddresses = () =>{
    wifiscanner.scan((err, data)=>{
        if (err) {
            console.log("Error : " + err);
            return;
        }
        //google is expecting the object to look a bit
        //different than what we get back from wifi-scanner
        //reformat the mac addresses below
        var macs = data.map(x=>{
            var obj = {}
            obj['macAddress'] = x.mac
            return obj
        })
        return getCoords(macs);
    });
}

const getCoords = (macAddresses) =>{
    var body = {
        "considerIp": "false",
        "wifiAccessPoints": macAddresses
    }
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=YOUR_API_KEY", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body) //be sure to serialize the value of the body 
        })
        .then(res=>res.json())
        .then((json, err)=>{
            if (err){
                console.log('Error: ' + err)
            } else {
                console.log(json)
            }
        })
}

getMacAddresses()