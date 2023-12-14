let map;
let permisoUbi = false;
let inBoxTemp = 
    `<div class="infoB" id="infoB">
        <div class="imgU">
            <img src={img} />
            <h4>Rol: {Rol}</h4>
        </div>
        <p>Status: <br/> <span class="statusCorner"></span> {desc}</p>
        <p>Name: {name}</p>
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
                    icon: 'C:/Users/arman/Downloads/Dux/sources/imgs/hos.png',
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

                /* arreglos para mostrar en la infobox*/
                let imgsToUse = [
                    'C:/Users/arman/Downloads/Dux/sources/imgs/p1.png',
                    'C:/Users/arman/Downloads/Dux/sources/imgs/p2.png'
                ]

                let namesUser = [
                    'Gabito Ballesteros',
                    'Junior H',
                ]

                let rolesUsr = [
                    'Vendedor',
                    'Instrumentador',
                    'Doctor'
                ]
                /*fin de arreglos para mostrar en la infobox */

                let randomLocations = addRandomLoc(loc, 2);
        
                randomLocations.forEach(function (ubi, index) {                                         
                    //generate multiples pushpins near current location
                    let locPointRandom = new Microsoft.Maps.Pushpin(ubi, {
                        title: rolesUsr[index % rolesUsr.length],
                        subTitle: 'En linea',
                        icon: imgsToUse[index % imgsToUse.length],
                        anchor: new Microsoft.Maps.Point(2, 2)                       
                    });        
                    map.entities.push(locPointRandom);

                    //object properties variables
                    let img = imgsToUse[index % imgsToUse.length];
                    let desc = 'En linea';
                    let Rol = rolesUsr[index % rolesUsr.length];
                    let name= namesUser[index % namesUser.length]
                    
                    //adding pushpins events
                    Microsoft.Maps.Events.addHandler(locPointRandom, 'click',() => {  
                        //creating differents infoboxes for show when you clicked the pushpins                        
                        let infoBox = new Microsoft.Maps.Infobox(ubi, {   
                            htmlContent: inBoxTemp.replace('{img}', img).replace('{desc}', desc).replace('{Rol}', Rol).replace('{name}', name)
                        });
                        
                        infoBox.setMap(map);
                        setTimeout(function(){                            
                            infoBox.dispose()                        
                        }, 2000)
                    })

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

