var currentCategory = attributeParameter.attribute;
var $formOptionSelected = $('option[value="' + currentCategory + '"]');
$formOptionSelected.attr('selected', '');  
makeMap(solarPowerPlants, countryLines, currentCategory);   

//LEAFLET MAP GENERATION
function makeMap(solarPowerPlants, countryLines, currentCategory) {
    // 1. Create main map element with settings
    var map = L.map('map', { center: [51.213728, 19.661492], zoom: 6, zoomControl: false});

    // 2. Adding tile layers
    // 2a) OpenStreetMap 
    var openStreetTile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap Contributors'}).addTo(map);
    // 2a) WorldImageryTile (ArcGIS) 
    var mapLink = '<a href="http://www.esri.com/">Esri</a>';
    var wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, DigitalGlobe, FSA, Swisstopo and the GIS User Community';
    var worldImageryTile = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: '&copy; '+ mapLink +', '+ wholink, maxZoom: 18}).addTo(map);    
    
    //3. Setting internal style for geojson data (method with passing style: object)
    var styleForCountryLines = {
        color: "#00FF00",
        weight: 2,
        fillOpacity: 0
    };
    var styleForSolarPowerPlants = function(feature) {
        var style1 = {
            weight: 4,
            fillOpacity: 0,
            color: 'yellow'
        };
        var style2 = {
            weight: 4,
            fillOpacity: 0,
            color: 'orange'
        };
        switch (feature.properties.f2) {
        case 'Wrocławska Elektrownia Słoneczna': return style1;
        case 'Prototyp elektrowni słonecznej': return style2;
        }
    }

    //4. Container for solar power plants markers; for later usage
    var markersSolarPowerPlants = [];

    //5. Adding backend vector data as geojson:

    //5a. Adding country lines
    var countryLines = L.geoJson(countryLines, {
        style: styleForCountryLines
    }).addTo(map);

    //5b. Adding solar power plants
    var solarPowerPlants = L.geoJson(solarPowerPlants, {
        onEachFeature: function(feature, layer) {
            
            // Adding popups with attributes to layer's polygons
            var customOptions = {
                className : 'custom'
            }
            var properties = feature.properties
            var table = addPopUpTable(properties)[0];
            layer.bindPopup(table, customOptions);
            
            //Adding marker to a layer
            var markerInCenter = addMarkerToSolarPowerPlant(feature, layer, currentCategory);

            //Assigning zooming function to marker
            markerInCenter.on('click', onClickZoomToSolarPowerPlant);
            //Callback Function 
            function onClickZoomToSolarPowerPlant(e) {
                // Setting boundary for polygons
                var layerCoordinates = feature.geometry.coordinates;
                var featureBounds = L.latLngBounds(layerCoordinates);
                // We need to swap coordinates, geojson (easting, northing), leaflet (northing, easting)
                var northEastLatitude = featureBounds._northEast.lat;
                var northEastLongitude = featureBounds._northEast.lng;
                var southWestLatitude = featureBounds._southWest.lat;
                var southWestLongitude = featureBounds._southWest.lng;
                var boundCoordinates = [[northEastLongitude, northEastLatitude],[southWestLongitude, southWestLatitude]];
                map.fitBounds(boundCoordinates);
            };
            
        },
        style: styleForSolarPowerPlants

    }).addTo(map);

    //6. Adding zoom and home view control 
    // Remember to remove the default zoomControl in L.map
    var lat = 51.213728;
    var lng = 19.661492;
    var zoom = 6;
    zoomHomeCustomize(lat, lng, zoom);
    var zoomHome = new L.Control.zoomHome();
    zoomHome.addTo(map);
        
    //6. Adding layer controls 
    addLayerControls(openStreetTile, worldImageryTile, markersSolarPowerPlants, countryLines, solarPowerPlants);

    //ADDITIONAL FUNCTIONS FOR LEAFLET MAP GENERATION

    //Function addPopUpTable
    function addPopUpTable(properties) {
        var $table = $('<table class="for-attributes">');

        var headers = ['Id', 'Etap projektu', 'Rodzaj spółdzielni', 'Miasto', 'Rok oddania do użytku', 'Adres', 'Ilość instalacji', 'Rodzaj instalacji', 'Moc całkowita instalacji', 'Produkcja energii na rok', 'Koszty', 'Realizator', 'Prognozowana redukcja CO2 (na rok?)', 'Info URL']
        var thBox = [];
        $(headers).each(function(index, element) {
            var $th = $('<th>');
            $th.text(element)
            thBox.push($th)
        })

        var tdBox = [];
        var propertiesKeys = Object.keys(properties);
        var propertiesLength = propertiesKeys.length;
        for (var value in properties) {
            var $td = $('<td>');
            if (value === 'f' + propertiesLength) {
                var a = $('<a href="' + properties[value] + '" target="_blank">' + properties[value] + '</a>');
                $td.append(a[0]);
            } else {
                $td.text(properties[value])
            }
            tdBox.push($td)
        };

        $(headers).each(function(index, element) {
            var $tableRow = $('<tr>');
            $tableRow.append(thBox[index]);
            $tableRow.append(tdBox[index]);
            $table.append($tableRow);
        })

    return $table;
    }

    //Function 
    function createCustomIcons() {
        var EtapProjektuIcon = L.Icon.extend({
            options: {
                iconSize:     [56.5, 36], // size of the icon
                iconAnchor:   [30.5, 34], // point of the icon which will correspond to marker'slocation
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            }
        });
        var elektrowniaIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_elektrownia.png'});
        var pilotażIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_prototyp.png'});
        return [elektrowniaIcon, pilotażIcon]
    }

    //Function 
    function addMarkerToSolarPowerPlant(feature, layer, currentCategory) {
        var customIcons = createCustomIcons();
        var textForMarker = feature.properties[currentCategory];
        var layerCenter = layer.getBounds().getCenter();
        if (feature.properties.f2 === 'Prototyp elektrowni słonecznej') {
            var markerInCenter = L.marker(layerCenter, { icon: customIcons[1] }).addTo(map);
            markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForPilotaz' }).openTooltip();
            markersSolarPowerPlants.push(markerInCenter)
        } else {
            var markerInCenter = L.marker(layerCenter, { icon: customIcons[0] }).addTo(map);
            markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForElektrownia' }).openTooltip();
            markersSolarPowerPlants.push(markerInCenter)     
        }
        return markerInCenter
    }  

    //Function 
    function zoomHomeCustomize(lat, lng, zoom) {
        // custom zoom bar control that includes a Zoom Home function
        L.Control.zoomHome = L.Control.extend({
            options: {
                position: 'topleft',
                zoomInText: '+',
                zoomInTitle: 'Zoom in',
                zoomOutText: '-',
                zoomOutTitle: 'Zoom out',
                zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
                zoomHomeTitle: 'Zoom home'
            },

            onAdd: function (map) {
            var controlName = 'gin-control-zoom',
                container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                options = this.options;
            this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            controlName + '-in', container, this._zoomIn);
            this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
            controlName + '-home', container, this._zoomHome);
            this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            controlName + '-out', container, this._zoomOut);
            this._updateDisabled();
            map.on('zoomend zoomlevelschange', this._updateDisabled, this);
            return container;
            },

            onRemove: function (map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
            },

            _zoomIn: function (e) {
                this._map.zoomIn(e.shiftKey ? 3 : 1);
            },

            _zoomOut: function (e) {
                this._map.zoomOut(e.shiftKey ? 3 : 1);
            },

            _zoomHome: function (e) {
                map.setView([lat, lng], zoom);
            },

            _createButton: function (html, title, className, container, fn) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;

                L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', fn, this)
                    .on(link, 'click', this._refocusOnMap, this);

                return link;
            },

            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';

                L.DomUtil.removeClass(this._zoomInButton, className);
                L.DomUtil.removeClass(this._zoomOutButton, className);

                if (map._zoom === map.getMinZoom()) {
                    L.DomUtil.addClass(this._zoomOutButton, className);
                }
                if (map._zoom === map.getMaxZoom()) {
                    L.DomUtil.addClass(this._zoomInButton, className);
                }
            }
        });   
    }  
    
    function addLayerControls(openStreetTile, worldImageryTile, markersSolarPowerPlants, countryLines, solarPowerPlants, markersSolarPowerPlantsLayer) {
        var baseMaps = {
            "OpenStreetMap": openStreetTile,
            "Satellite - ArcGIS World Imagery ": worldImageryTile
        };
        var markersSolarPowerPlantsLayer = L.layerGroup(markersSolarPowerPlants);
        var overlayMaps = {
            "Granice państw": countryLines,
            "Poligony budynków": solarPowerPlants,
            "Ikony miejskich elektrowni słonecznych": markersSolarPowerPlantsLayer
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);

        //Temporary solution for problems with 'checked' attribute for "Ikony miejskich elektrowni słonecznych": markersSolarPowerPlantsLayer
        var $span = $('div span:contains("Ikony miejskich elektrowni słonecznych")')
        var parentDiv = ($($span[0]).parent()[0]);
        var $input =  $(parentDiv).find('input');
        $input.attr('checked','')
    }
}