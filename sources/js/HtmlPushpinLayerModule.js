//A simple class that defines a HTML pushpin.
var HtmlPushpin = function (loc, html, anchor) {
    this.location = loc;
    this.anchor = anchor;
    //A property for storing data relative to the pushpin.
    this.metadata = null; 
    //Create the pushpins DOM element.
    this._element = document.createElement('div'); 
    this._element.innerHTML = html;
    this._element.style.position = 'absolute';
   };
   //A reusable class for overlaying HTML elements as pushpins on the map.
   var HtmlPushpinLayer = function () {
    //Store the pushpins.
    this._pushpins = null;
    //A variable to store the viewchange event handler id.
    this.viewChangeEventHandler = null;
    //A variable to store a reference to the container for the HTML pushpins.
    this.container = null;
    //Method to define the pushpins to display in the layer.
    this.setPushpins = function (pushpins) {
    //Store the pushpin data.
    this._pushpins = pushpins;
    //Clear the container.
    if (this.container) {
    this.container.innerHTML = '';
    if (pushpins) {
    //Add the pushpins to the container.
    for (var i = 0, len = pushpins.length; i < len; i++) {
    this.container.appendChild(pushpins[i]._element);
    }
    }
    }
    this.updatePositions();
    };
    //A function that updates the position of a HTML pushpin element on the map.
    this._updatePushpinPosition = function (pin) {
    if (this.getMap()) {
    //Calculate the pixel location of the pushpin.
    var topLeft = this.getMap().tryLocationToPixel(pin.location,
   Microsoft.Maps.PixelReference.control);
    //Offset position to account for anchor.
    topLeft.x -= pin.anchor.x;
    topLeft.y -= pin.anchor.y;
    //Update the position of the pushpin element.
    pin._element.style.left = topLeft.x + 'px';
    pin._element.style.top = topLeft.y + 'px';
    }
    };
    //A function that updates the positions of all HTML pushpins in the layer
    this.updatePositions = function () {
    if (this._pushpins) {
    for (var i = 0, len = this._pushpins.length; i < len; i++) {
    this._updatePushpinPosition(this._pushpins[i]);
    }
    }
    };
   };
   //Define a custom overlay class that inherts from the CustomOverlay class.
   HtmlPushpinLayer.prototype = new Microsoft.Maps.CustomOverlay({
   beneathLabels: false });
   
   HtmlPushpinLayer.prototype.onAdd = function () {
    //Create a div that will hold the pushpins.
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.left = '0px';
    this.container.style.top = '0px';
    this.setHtmlElement(this.container);
   };
   HtmlPushpinLayer.prototype.onLoad = function () {
    var self = this;
    //Reset pushpins as overlay is now loaded.
    self.setPushpins(self._pushpins);
    //Update the position of the pushpin when the view changes.
    this.viewChangeEventHandler =
   Microsoft.Maps.Events.addHandler(self.getMap(), 'viewchange', function () {
    self.updatePositions();
    });
   };
   HtmlPushpinLayer.prototype.onRemove = function () {
    //Remove the event handler that is attached to the map.
    Microsoft.Maps.Events.removeHandler(this.viewChangeEventHandler);
   };
   //Call the module loaded function.
   Microsoft.Maps.moduleLoaded('HtmlPushpinLayerModule');