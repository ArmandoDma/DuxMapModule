let map, results, queryURL;
let permisoUbi = false;
let inBoxTemp = 
`<div class="infoB" id="infoB">
<div class="imgU">
<img src={img} />
<h4>Rol: {Rol}</h4>
</div>
<p>Status: <br/> <span class="statusCorner"></span> {desc}</p>
<p>Name: {name}</p>
</div>`;

/* arreglos para mostrar en la infobox*/
let namesUserDos = [
    { nombre: 'Junior H', rol: 'Doctor', icon: '../sources/imgs/p2.png' },
    { nombre: 'Gabito Ballesteros', rol: 'Instrumentador', icon: '../sources/imgs/p1.png' },
    { nombre: 'Peso Pluma', rol: 'Vendedor', icon: '../sources/imgs/p4.png' },
    { nombre: 'Fuerza Regida', rol: 'Doctor', icon: '../sources/imgs/p5.png' },
    { nombre: 'Natanael Cano', rol: 'Instrumentador', icon: '../sources/imgs/p3.png' },
    { nombre: 'Armando Dma', rol: 'Vendedor', icon: '../sources/imgs/p6.png' }
];
/*fin de arreglos para mostrar en la infobox */

window.addEventListener('load', () => {
    GetMap()
    getSlctValue()
});

function GetMap(){
    map = new Microsoft.Maps.Map('#Map',{
        credentials: 'ArqG4VUXzrsxfVPNZDS7pu3DCTbBXf4NazO7xFtayC1EqP4PcnG4rn1XskILNby5',
        zoom: 10,
        center: new Microsoft.Maps.Location(25.762037871269943, -100.40887199563257),
        showLocateMeButton: false,
        showMapTypeSelector: false
    });      
    
    Microsoft.Maps.registerModule('HtmlPushpinLayerModule',
    '../sources/js/HtmlPushpinLayerModule.js');

}

let sdsDataSourceUrl = 'http://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest?key=ArqG4VUXzrsxfVPNZDS7pu3DCTbBXf4NazO7xFtayC1EqP4PcnG4rn1XskILNby5&$format=json';

function getCurrentLocation() {
    if(!permisoUbi){
        if(navigator.geolocation){           
            navigator.geolocation.getCurrentPosition((pos) => {                  
                let loc = new Microsoft.Maps.Location(
                    pos.coords.latitude,
                    pos.coords.longitude
                );

                //pins created
                Microsoft.Maps.loadModule('HtmlPushpinLayerModule', function(){       
                         var htmlTemplate = `<div class="PoU">{text}</div>`;
                         var pins = [
                         new HtmlPushpin(loc, htmlTemplate.replace('{text}',
                        ''), new Microsoft.Maps.Point(2,2))
                         ];
                         var layer = new HtmlPushpinLayer();
                         layer.setPushpins(pins);
                         map.layers.insert(layer);
                        
                });
        
                map.setView({center: loc, zoom: 16});                                                

                let randomLocations = addRandomLoc(loc, 6);
                namesUserDos.forEach((user, index) => {    
                    let userLocation = randomLocations[index];
                    //generate multiples pushpins near current location
                    let locPointRandom = new Microsoft.Maps.Pushpin(userLocation, {
                        title: user.nombre,
                        subTitle: 'En linea',
                        icon: user.icon,
                        anchor: new Microsoft.Maps.Point(2, 2)                       
                    });
                    map.entities.push(locPointRandom);
                    //adding pushpins events
                    Microsoft.Maps.Events.addHandler(locPointRandom, 'click',() => {
                        showUserIBox(user, userLocation)
                    })
                })                            
                Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', 
                    function () {
                        getNearByLocations(loc);
                    }
                );                   
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
function showUserIBox(user, location){
    //creating differents infoboxes for show when you clicked the pushpins                        
    let infoBox = new Microsoft.Maps.Infobox(location, {   
        htmlContent: inBoxTemp.replace('{img}', user.icon).replace('{desc}', 'Online').replace('{Rol}', user.rol).replace('{name}', user.nombre)
    });
    
    infoBox.setMap(map);
    setTimeout(function(){                            
        infoBox.dispose()                        
    }, 2000)
}

function getNearByLocations(loc) {       
    let queryOptions = { 
        queryUrl: sdsDataSourceUrl, 
        spatialFilter: { 
            spatialFilterType: 'nearby', 
            location: loc, 
            radius: 25 
        }, 
        filter: new 
        Microsoft.Maps.SpatialDataService.Filter('EntityTypeID','eq',8060)  
    }; 
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (data, response) { 
        if (data && data.length > 0) {
            data.forEach(function(result) {                    
                const metadata = result.metadata;                
                const hospitalLoc = new Microsoft.Maps.Location(metadata.Latitude, metadata.Longitude)
                let hosPin = new Microsoft.Maps.Pushpin(hospitalLoc, {
                    title: metadata.DisplayName,
                    icon: '../sources/imgs/hos.png',
                    anchor: new Microsoft.Maps.Point(2,2)

                });                
                map.entities.push(hosPin)
                
                let coordsAccuracy = 100;            
                Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function (){                                  
                    let path = Microsoft.Maps.SpatialMath.getRegularPolygon(hosPin.getLocation(),
                        coordsAccuracy, 36, Microsoft.Maps.SpatialMath.Meters);
                    
                    let poly = new Microsoft.Maps.Polygon(path,{
                        title: metadata.DisplayName
                    });
                        map.entities.push(poly);                     
                        polCircles.push(poly)                    
                });
            });
        } else {
            console.warn(response);
            console.log('No se encontraron hospitales cercanos.');
        }        
    }); 
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

//getting and adding options from the select-boxes
let polCircles = [];

function getSlctValue(){
    let slcts = document.querySelectorAll('#slins');
    slcts.forEach((boxes) => {   
        let clickedSlct = false;                             
        if(!clickedSlct){
            boxes.innerHTML = '';
            let currentRole = boxes.getAttribute('name')                
            let filteredUsers = namesUserDos.filter((name) => {
                return name.rol === currentRole;
            });
            filteredUsers.forEach((name) => {
                let elmt = document.createElement('option');
                elmt.innerHTML = name.nombre;
                elmt.setAttribute('value', name.nombre);
                elmt.setAttribute('class', 'optUser');
                boxes.appendChild(elmt);
            })
            clickedSlct = true
        }                     
    })
    let sHos = document.querySelector('#sHos');
    let clickedSlct = false;        
    sHos.addEventListener('click', () => {
        if(!clickedSlct){            
            polCircles.forEach((Hos) => {
                let HosTi = Hos.entity.title;
                let item = document.createElement('option')
                item.innerHTML = HosTi
                item.setAttribute('value', HosTi)
                sHos.appendChild(item);                    
            })
            clickedSlct = true;
        }
    })
}

//adding filter to the elements
let btnAddFil = document.getElementById('btnaddFil'),
btnrevFil = document.getElementById('btnrevFil');

function addFilter() {
    let slcts = document.querySelectorAll('#slins');
    let selectedRoles = Array.from(slcts).map((box) => box.value);
    let sHos = document.getElementById('sHos').value;
    let pushpins = map.entities.getPrimitives();   
    pushpins.forEach((pushpin) => {        
        let pushpinRole = pushpin.getTitle();
        if(selectedRoles.includes(pushpinRole)){
            let user = namesUserDos.find((user) => user.nombre === pushpinRole);
            if(user){            
                pushpin.setOptions({visible: false});
            }
        }
        if(sHos === pushpinRole){
            pushpin.setOptions({visible: false});
        }
    });
    polCircles.forEach((polys) => {
        let polTitle = polys.entity.title;
        if(sHos === polTitle){
            polys.setOptions({visible: false});
        }
    })
    
}
btnAddFil.addEventListener('click', addFilter)


function revFil(){
    let slcts = document.querySelectorAll('#slins');
    let selectedRoles = Array.from(slcts).map((box) => box.value);
    let sHos = document.getElementById('sHos').value;
    let pushpins = map.entities.getPrimitives();          
    pushpins.forEach((pushpin) => {        
        let pushpinRole = pushpin.getTitle();
        if(selectedRoles.includes(pushpinRole)){
            let user = namesUserDos.find((user) => user.nombre === pushpinRole);
            if(user){            
                pushpin.setOptions({visible: true})   
            }
        }
        if(sHos === pushpinRole){
            pushpin.setOptions({visible: true});
        }
    });
}

btnrevFil.addEventListener('click', revFil)