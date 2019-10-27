                var currentCategory = attributeParameter.attribute;
                var $formOptionSelected = $('option[value="' + currentCategory + '"]');
                $formOptionSelected.attr('selected','');  
                makeMap(solarPowerPlants, countryLines, currentCategory);   
        
        function makeMap(solarPowerPlants, countryLines, currentCategory) {
        //LEAFLET MAP GENERATION
                // 1. Create main map element with settings
                var map = L.map('map', { center: [51.213728, 19.661492], zoom: 6, zoomControl: false});

                // 2. Adding tile layers
                // 2a) OpenStreetMap 
                var openStreetTile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap'}).addTo(map);
                // 2a) WorldImageryTile (ArcGIS) 
                var mapLink = '<a href="http://www.esri.com/">Esri</a>';
                var wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
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

                //5. Adding backend vector data as geojson
                //5a. Adding country lines
                var countryLines = L.geoJson(countryLines, {
                    style: styleForCountryLines
                }).addTo(map);

                // function addPopUpTable(properties) {
                //     // Box do wyswietlania atrybutow w popup (rozne wersje)
                //     // 1) Tabela
                //     var table = document.createElement('table');
                //     var tableHeader = document.createElement('thead');
                //     var tableRow = document.createElement('tr');

                //     var headers = ['Id', 'Etap projektu', 'Rodzaj spółdzielni', 'Miasto', 'Rok oddania do użytku', 'Adres', 'Ilość instalacji', 'Rodzaj instalacji', 'Moc całkowita instalacji', 'Produkcja energii na rok', 'Koszty', 'Realizator', 'Prognozowana redukcja CO2 (na rok?)', 'Info URL']
                //     var thBox = []
                //     for (var it = 0; it < headers.length; it++) {
                //         var th = document.createElement('th');
                //         th.innerText = headers[it];
                //         tableHeader.appendChild(th)
                //         thBox.push(th)
                //     } 
                //     var tdBox = [];
                //     var propertiesKeys = Object.keys(properties);
                //     var propertiesLength = propertiesKeys.length;
                //     for (var value in properties) {
                //         var td = document.createElement('td');
                //         if (value === 'f' + propertiesLength) {
                //             var a = $('<a href="' + properties[value] + '" target="_blank">' + properties[value] + '</a>');
                //             td.appendChild(a[0]);
                //         } else {
                //             td.innerText = properties[value];
                //         }
                //         tableRow.appendChild(td);
                //         tdBox.push(td)
                //     };

                //     for (var it = 0; it < headers.length; it++) {
                //         var tableRow2 = document.createElement('tr');
                //         tableRow2.appendChild(thBox[it]);
                //         tableRow2.appendChild(tdBox[it]);
                //         table.appendChild(tableRow2);
                //     };

                // return table;
                // }

                var solarPowerPlants = L.geoJson(solarPowerPlants, {
                    onEachFeature: function(feature, layer) {
                        // Style for setting Popup window length
                        var customOptions = {
                            className : 'custom'
                        }

                        var properties = feature.properties
                        var table = addPopUpTable(properties)[0];
                        layer.bindPopup(table, customOptions);
                        
                        // Customowe ikony

                        var EtapProjektuIcon = L.Icon.extend({
                            options: {
                                iconSize:     [56.5, 36], // size of the icon
                                iconAnchor:   [30.5, 34], // point of the icon which will correspond to marker'slocation
                                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                            }
                        });

                        var elektrowniaIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_elektrownia.png'});
                        var prototypIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_prototyp.png'});

                        // Dodanie markera w centrum danej warstwy
                        var textForMarker = feature.properties[currentCategory];
                        var layerCenter = layer.getBounds().getCenter();
                        if (feature.properties.f2 === 'Prototyp elektrowni słonecznej'){
                            var markerInCenter = L.marker(layerCenter, {icon: prototypIcon}).addTo(map);
                            markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForPrototyp' }).openTooltip();
                            markersSolarPowerPlants.push(markerInCenter)
                        } else {
                            var markerInCenter = L.marker(layerCenter, {icon: elektrowniaIcon}).addTo(map);
                            markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForElektrownia' }).openTooltip();
                            markersSolarPowerPlants.push(markerInCenter)     
                        }

                        //Funkcja na zoom po kliknieciu markera
                        function onClickZoomToElektrownia(event) {
                            // Ustalanie boundary polygon
                            var test = feature.geometry.coordinates;
                            var featureBounds = L.latLngBounds(test);
                            // Trzeba zamienić współrzedne miejscami - geojson i leaflet maja odwrtotnie
                            var northEastLatitude = featureBounds._northEast.lat;
                            var northEastLongitude = featureBounds._northEast.lng;
                            var southWestLatitude = featureBounds._southWest.lat;
                            var southWestLongitude = featureBounds._southWest.lng;
                            var boundCoordinates = [[northEastLongitude, northEastLatitude],[southWestLongitude, southWestLatitude]];
                            map.fitBounds(boundCoordinates);
                        };
                        markerInCenter.on('click', onClickZoomToElektrownia);
                        
                    },
                    style: styleForSolarPowerPlants

                }).addTo(map);

                
                function addPopUpTable(properties) {
                    var $table = $('<table>');

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

                // Adding home view control 

                var lat = 51.213728;
                var lng = 19.661492;
                var zoom = 6;
                // set up the map and remove the default zoomControl

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

                // add the new control to the map
                var zoomHome = new L.Control.zoomHome();
                zoomHome.addTo(map);

                // Map controls
                var baseMaps = {
                    "OpenStreetMap": openStreetTile,
                    "Satellite - ArcGIS World Imagery ": worldImageryTile
                };

                var markersSolarPowerPlantsLayer = L.layerGroup(markersSolarPowerPlants);
                console.log(markersSolarPowerPlants)

                var overlayMaps = {
                    "Country boundries": countryLines,
                    "Poligony miejskich elektrowni słoneczncyh": solarPowerPlants,
                    "Markery miejskich elektrowni słonecznych": markersSolarPowerPlantsLayer
                };

                L.control.layers(baseMaps, overlayMaps).addTo(map);
        }
        // (function() {
        //     'use strict';
        
        //     $(function() {
        //         //Setting current selected form option 
        //         var currentCategory = attributeParameter.attribute;
        //         var $formOptionSelected = $('option[value="' + currentCategory + '"]');
        //         $formOptionSelected.attr('selected','');
        //         makeMap();
        //         // autocompleterInit();
        //         // bindPoemFormEvents();
        //         // onChangeOfInputValue();
        //         // // useDrawer();
        //         // toggleElement();
        //         // $('form[data-ajax]', document.body).on('submit', formSubmitHandler);
        //     });
        
        //     function makeMap() {
        //         //LEAFLET MAP GENERATION
        //         // 1. Create main map element with settings
        //         var map = L.map('map', { center: [51.213728, 19.661492], zoom: 6, zoomControl: false});

        //         // 2. Adding tile layers
        //         // 2a) OpenStreetMap 
        //         var openStreetTile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap'}).addTo(map);
        //         // 2a) WorldImageryTile (ArcGIS) 
        //         var mapLink = '<a href="http://www.esri.com/">Esri</a>';
        //         var wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        //         var worldImageryTile = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: '&copy; '+ mapLink +', '+ wholink, maxZoom: 18}).addTo(map);    
                
        //         //3. Setting internal style for geojson data (method with passing style: object)
        //         var styleForCountryLines = {
        //             color: "#00FF00",
        //             weight: 2,
        //             fillOpacity: 0
        //         };
        //         var styleForSolarPowerPlants = function(feature) {
        //             var style1 = {
        //                 weight: 4,
        //                 fillOpacity: 0,
        //                 color: 'yellow'
        //             };
        //             var style2 = {
        //                 weight: 4,
        //                 fillOpacity: 0,
        //                 color: 'orange'
        //             };
        //             switch (feature.properties.f2) {
        //             case 'Wrocławska Elektrownia Słoneczna': return style1;
        //             case 'Prototyp elektrowni słonecznej': return style2;
        //             }
        //         }

        //         //4. Container for solar power plants markers; for later usage
        //         var markersSolarPowerPlants = [];

        //         //5. Adding backend vector data as geojson
        //         //5a. Adding country lines
        //         var countryLines = L.geoJson(countryLines, {
        //             style: styleForCountryLines
        //         }).addTo(map);
                
        //         var solarPowerPlants = L.geoJson(solarPowerPlants, {
        //             onEachFeature: function(feature, layer) {
                        
        //                 // Box do wyswietlania atrybutow w popup (rozne wersje)
        //                 // 1) Tabela
        //                 var table = document.createElement('table');
        //                 var tableHeader = document.createElement('thead');
        //                 var tableBody = document.createElement('tbody');
        //                 var tableRow = document.createElement('tr');

        //                 var headers = ['Id', 'Etap projektu', 'Rodzaj spółdzielni', 'Miasto', 'Rok oddania do użytku', 'Adres', 'Ilość instalacji', 'Rodzaj instalacji', 'Moc całkowita instalacji', 'Produkcja energii na rok', 'Koszty', 'Realizator', 'Prognozowana redukcja CO2 (na rok?)', 'Info URL']
        //                 var thBox = []
        //                 for (var it = 0; it < headers.length; it++) {
        //                     var th = document.createElement('th');
        //                     th.innerText = headers[it];
        //                     tableHeader.appendChild(th)
        //                     thBox.push(th)
        //                 }
        //                 console.log(thBox)
                        
        //                 var properties = feature.properties
        //                 var tdBox = [];
        //                 var propertiesKeys = Object.keys(properties);
        //                 var propertiesLength = propertiesKeys.length;
        //                 for (var value in properties) {
        //                     var td = document.createElement('td');
        //                     if (value === 'f' + propertiesLength) {
        //                         var a = $('<a href="' + properties[value] + '" target="_blank">' + properties[value] + '</a>');
        //                         //- var a = document.createElement('a');
        //                         //- a.innerText = properties[value];
        //                         td.appendChild(a[0]);
        //                     } else {
        //                         td.innerText = properties[value];
        //                     }
        //                     tableRow.appendChild(td);
        //                     tdBox.push(td)
        //                 };

        //                 console.log(tdBox)

        //                 var table2 = document.createElement('table');
        //                 for (var it = 0; it < headers.length; it++) {
        //                     var tableRow2 = document.createElement('tr');
        //                     tableRow2.appendChild(thBox[it]);
        //                     tableRow2.appendChild(tdBox[it]);
        //                     table2.appendChild(tableRow2);
        //                 }
        //                 console.log(table2)

        //                 var ul = document.createElement('ul');
        //                 for (var it = 0; it < headers.length; it++) {
        //                     var li = document.createElement('li');
        //                     li.innerText = headers[it] + ': ' + feature.properties['f' + (it + 1)];
        //                     ul.appendChild(li);
        //                 }
        //                 console.log(ul);

        //                 var customOptions = {
        //                     className : 'custom'
        //                 }

        //                 layer.bindPopup(table2, customOptions);
        //                 // Usuwamy style z atrybutow okienka popup zeby sie dopasował do zawartości
        //                 // layer.on('click', function(e){
        //                 //     var $popup = $('.leaflet-popup-content');
        //                 //     $popup.attr('style', '')
        //                 // })
                        
        //                 // Customowe ikony

        //                 var EtapProjektuIcon = L.Icon.extend({
        //                     options: {
        //                         iconSize:     [56.5, 36], // size of the icon
        //                         iconAnchor:   [30.5, 34], // point of the icon which will correspond to marker'slocation
        //                         popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        //                     }
        //                 });

        //                 var elektrowniaIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_elektrownia.png'});
        //                 var prototypIcon = new EtapProjektuIcon({iconUrl: 'images/ikona_prototyp.png'});

        //                 // Dodanie markera w centrum danej warstwy
        //                 var textForMarker = feature.properties[currentCategory];
        //                 var layerCenter = layer.getBounds().getCenter();
        //                 if (feature.properties.f2 === 'Prototyp elektrowni słonecznej'){
        //                     var markerInCenter = L.marker(layerCenter, {icon: prototypIcon}).addTo(map);
        //                     markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForPrototyp' }).openTooltip();
        //                     markersSolarPowerPlants.push(markerInCenter)
        //                 } else {
        //                     var markerInCenter = L.marker(layerCenter, {icon: elektrowniaIcon}).addTo(map);
        //                     markerInCenter.bindTooltip(textForMarker, { permanent: true, direction: 'bottom', className: 'styleForElektrownia' }).openTooltip();
        //                     markersSolarPowerPlants.push(markerInCenter)     
        //                 }

        //                 //Funkcja na zoom po kliknieciu markera
        //                 function onClickZoomToElektrownia(event) {
        //                     // Ustalanie boundary polygon
        //                     var test = feature.geometry.coordinates;
        //                     var featureBounds = L.latLngBounds(test);
        //                     // Trzeba zamienić współrzedne miejscami - geojson i leaflet maja odwrtotnie
        //                     var northEastLatitude = featureBounds._northEast.lat;
        //                     var northEastLongitude = featureBounds._northEast.lng;
        //                     var southWestLatitude = featureBounds._southWest.lat;
        //                     var southWestLongitude = featureBounds._southWest.lng;
        //                     var boundCoordinates = [[northEastLongitude, northEastLatitude],[southWestLongitude, southWestLatitude]];
        //                     map.fitBounds(boundCoordinates);
        //                 };
        //                 markerInCenter.on('click', onClickZoomToElektrownia);
                        
        //             },
        //             style: styleForSolarPowerPlants, 
        //         }).addTo(map);

        //         // Adding home view control 

        //         var lat = 51.213728;
        //         var lng = 19.661492;
        //         var zoom = 6;
        //         // set up the map and remove the default zoomControl

        //         // custom zoom bar control that includes a Zoom Home function
        //         L.Control.zoomHome = L.Control.extend({
        //             options: {
        //                 position: 'topleft',
        //                 zoomInText: '+',
        //                 zoomInTitle: 'Zoom in',
        //                 zoomOutText: '-',
        //                 zoomOutTitle: 'Zoom out',
        //                 zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        //                 zoomHomeTitle: 'Zoom home'
        //             },

        //             onAdd: function (map) {
        //             var controlName = 'gin-control-zoom',
        //                 container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
        //                 options = this.options;
        //             this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        //             controlName + '-in', container, this._zoomIn);
        //             this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        //             controlName + '-home', container, this._zoomHome);
        //             this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        //             controlName + '-out', container, this._zoomOut);
        //             this._updateDisabled();
        //             map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        //             return container;
        //             },

        //             onRemove: function (map) {
        //                 map.off('zoomend zoomlevelschange', this._updateDisabled, this);
        //             },

        //             _zoomIn: function (e) {
        //                 this._map.zoomIn(e.shiftKey ? 3 : 1);
        //             },

        //             _zoomOut: function (e) {
        //                 this._map.zoomOut(e.shiftKey ? 3 : 1);
        //             },

        //             _zoomHome: function (e) {
        //                 map.setView([lat, lng], zoom);
        //             },

        //             _createButton: function (html, title, className, container, fn) {
        //                 var link = L.DomUtil.create('a', className, container);
        //                 link.innerHTML = html;
        //                 link.href = '#';
        //                 link.title = title;

        //                 L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
        //                     .on(link, 'click', L.DomEvent.stop)
        //                     .on(link, 'click', fn, this)
        //                     .on(link, 'click', this._refocusOnMap, this);

        //                 return link;
        //             },

        //             _updateDisabled: function () {
        //                 var map = this._map,
        //                     className = 'leaflet-disabled';

        //                 L.DomUtil.removeClass(this._zoomInButton, className);
        //                 L.DomUtil.removeClass(this._zoomOutButton, className);

        //                 if (map._zoom === map.getMinZoom()) {
        //                     L.DomUtil.addClass(this._zoomOutButton, className);
        //                 }
        //                 if (map._zoom === map.getMaxZoom()) {
        //                     L.DomUtil.addClass(this._zoomInButton, className);
        //                 }
        //             }
        //         });

        //         // add the new control to the map
        //         var zoomHome = new L.Control.zoomHome();
        //         zoomHome.addTo(map);

        //         // Map controls
        //         var baseMaps = {
        //             "OpenStreetMap": openStreetTile,
        //             "Satellite - ArcGIS World Imagery ": worldImageryTile
        //         };

        //         var markersSolarPowerPlantsLayer = L.layerGroup(markersSolarPowerPlants);
        //         console.log(markersSolarPowerPlants)

        //         var overlayMaps = {
        //             "Country boundries": countryLines,
        //             "Poligony miejskich elektrowni słoneczncyh": solarPowerPlants,
        //             "Markery miejskich elektrowni słonecznych": markersSolarPowerPlantsLayer
        //         };

        //         L.control.layers(baseMaps, overlayMaps).addTo(map);
        //     }
        // });


 
