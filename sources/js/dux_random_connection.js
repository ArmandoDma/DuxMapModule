let map;
let permisoUbi = false;
let inBoxTemp = 
    `<div class="infoB">
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>`

window.addEventListener('load', GetMap);


function GetMap(){
    map = new Microsoft.Maps.Map('#Map',{
        credentials: 'ArqG4VUXzrsxfVPNZDS7pu3DCTbBXf4NazO7xFtayC1EqP4PcnG4rn1XskILNby5',
        zoom: 10,
        center: new Microsoft.Maps.Location(25.762037871269943, -100.40887199563257),
        showLocateMeButton: false,
        showMapTypeSelector: false
    });
}

function getCurrentLocation() {        
    if(!permisoUbi){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((pos) => {
                let loc = new Microsoft.Maps.Location(
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                 
                //pins created
                let pin = new Microsoft.Maps.Pushpin(loc,{     
                    title: 'You',
                    color: '#4d88f9',
                    anchor: new Microsoft.Maps.Point(2,2),
                });                    
                
                map.entities.push(pin);

                let pinWC = new Microsoft.Maps.Location(25.762037871269943, -100.40887199563257)
                var cine = new Microsoft.Maps.Pushpin(pinWC, {
                    icon: 'C:/Users/arman/Downloads/Dux/sources/imgs/heart.png',
                    title: 'Hospital',
                    anchor: new Microsoft.Maps.Point(2, 2)
                });
                //Add the pushpin to the map.
                map.entities.push(cine);

                //giving a value to the accuracy property and rendering a radio transparent circle with a pushpin.
                let coordsAccuracy = 100;            
                Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function (){
                    let path = Microsoft.Maps.SpatialMath.getRegularPolygon(pinWC,
                        coordsAccuracy, 36, Microsoft.Maps.SpatialMath.Meters);
        
                    let poly = new Microsoft.Maps.Polygon(path);
                         map.entities.push(poly);                     
                })
        
                map.setView({center: loc, zoom: 16});
        
                let imgsToUse = [
                    'C:/Users/arman/Downloads/Dux/sources/imgs/p1.png',
                    'C:/Users/arman/Downloads/Dux/sources/imgs/p2.png'
                ]
        
                let randomLocations = addRandomLoc(loc, 2);
        
                randomLocations.forEach(function (ubi, index) {                   
                    //generate multiples pushpins near current location
                    let locPointRandom = new Microsoft.Maps.Pushpin(ubi, {
                        title: `User `+ (index + 1),
                        icon: imgsToUse[index % imgsToUse.length],
                        anchor: new Microsoft.Maps.Point(2, 2)
                    });
        
                    map.entities.push(locPointRandom);

                     //creating differents infoboxes for show when you clicked the pushpins
                     let title = locPointRandom.entity.title;                     
                     let desc = `<img
                     src="https://www.bingmapsportal.com/Content/images/poi_custom.png"
                     align="left" style="margin-right:5px;"/>This is a description with custom
                     html. <a href="http://bing.com/maps" target="_blank">Link</a>`;
                     
                     let infoBox = new Microsoft.Maps.Infobox(ubi, {
                         htmlContent: inBoxTemp.replace('{title}', title).replace('{desc}', desc)
                     });
                     
                     infoBox.setMap(map);
                });
            }, (error) => {
                console.error('Has denegado el acceso a tu ubicación, intentalo de nuevo.', error.message);
                permisoUbi = false;
            });
            permisoUbi = true;
        }else{
            console.info('Ya has permitido la ubicación');
        }
    }
}

let getLoc = document.getElementById('getLocBtn');
getLoc.addEventListener('click', getCurrentLocation)

function addRandomLoc(center, count){
    const radiusMeters = 1500;
    const randomLocations = [];

    for(let i =0; i < count; i++){
        const randomDistance = Math.random() * radiusMeters;
        const randomAngle = Math.random() * Math.PI;

        const lat = center.latitude + (randomDistance / 111300) * Math.cos(randomAngle);
        const lng = center.longitude + (randomDistance /(111300 * Math.cos(center.latitude * (Math.PI / 180)))) * Math.sin(randomAngle);

        randomLocations.push(new Microsoft.Maps.Location(lat, lng));

    }

    return randomLocations;
}

