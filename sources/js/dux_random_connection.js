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

import { dbRef } from "./firebase.js";
import { child, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

window.addEventListener('load', () => {
    GetMap();
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
                getSlctValue();
                addUserRemote();

                Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', 
                function () {
                    getNearByLocations(loc);
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

function addUserRemote(){
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {                        
            snapshot.forEach((childSnapshots) =>{
                let userData = childSnapshots.val() 
                let {lat, lng} = userData.ubicacion
                const userPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lat, lng),{
                    title: userData.nombre,
                    subTitle: userData.rol,
                    icon: userData.icon,
                    anchor: new Microsoft.Maps.Point(2,2),
                    draggable: true            
                });        
                const location = userPin.getLocation()
                map.entities.push(userPin);  
            
                //adding pushpins events
                Microsoft.Maps.Events.addHandler(userPin, 'click',() => {
                    showUserIBox(userData, location)
                })
            })
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });        
}

function showUserIBox(userData, location){
    //creating differents infoboxes for show when you clicked the pushpins                        
    let infoBox = new Microsoft.Maps.Infobox(location, {   
        htmlContent: inBoxTemp.replace('{img}', userData.icon).replace('{desc}', 'Online').replace('{Rol}', userData.rol).replace('{name}', userData.nombre)
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
            radius: 5 
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
                    
                    let poly = new Microsoft.Maps.Polygon(path, {
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

//getting and adding options from the select-boxes
let polCircles = [];

function getSlctValue(){
    let slcts = document.querySelectorAll('#slins');
    slcts.forEach((boxes) => {   
        let clickedSlct = false;                             
        if(!clickedSlct){
            boxes.innerHTML = '';       
            let currentRole = boxes.getAttribute('name')
            get(child(dbRef, 'users/')).then(snapshot => {
                if(snapshot.exists()){
                    let snapshots = Object.values(snapshot.val())                                                                       
                    let filteredUsers = snapshots.filter((user) => {                
                        return user.rol === currentRole;
                    });

                    filteredUsers.forEach((user) => {
                        let elmt = document.createElement('option');
                        elmt.innerHTML = user.nombre;
                        elmt.setAttribute('value', user.nombre);
                        elmt.setAttribute('class', 'optUser');
                        boxes.appendChild(elmt);
                    })                    
                }
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
    
    get(child(dbRef, 'users/')).then(snapshot => {
        if(snapshot.exists()){
            let snapFil = Object.values(snapshot.val())
            pushpins.forEach((pushpin) => {
                pushpin.setOptions({ visible: true });
            });
            pushpins.forEach((pushpin) => {        
                let pushpinRole = pushpin.getTitle();  
                if(selectedRoles.includes(pushpinRole)){        
                    let user = snapFil.find((user) => user.nombre === pushpinRole);            
                    if(user){            
                        pushpin.setOptions({visible: false});
                    }
                }
                if(sHos === pushpinRole){            
                    pushpin.setOptions({visible: false});            
                }
            });      
        }
    })
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