// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var map;
var selectControl;
var vectorLayers = [];

function initializeMap() {

    var maxExtent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
        restrictedExtent = maxExtent.clone();

    function button1Clicked() { alert("clicked"); }
    
    var panel = new OpenLayers.Control.Panel({ displayClass: 'Panel1' });
    panel.addControls([
        new OpenLayers.Control.Button({
            displayClass: 'first', 
            trigger: button1Clicked, 
            title: 'Button is to be clicked'
        })
    ]);

    map = new OpenLayers.Map({
        div: 'map', 
        controls: [
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.LayerSwitcher(),
            panel
        ],
        projection: new OpenLayers.Projection('EPSG:900913'),
        displayProjection: new OpenLayers.Projection('EPSG:4326'),
        units: 'm',
        numZoomLevels: 18,
        maxResolution: 156543.0339,
        maxExtent: maxExtent,
        restrictedExtent: restrictedExtent,
        layers: [
            new OpenLayers.Layer.OSM(), // open street map
            new OpenLayers.Layer.XYZ('SmallScale',
                'http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/${z}/${y}/${x}', {
                sphericalMercator: true,
                isBaseLayer: true,
                attribution:'USGS - The National Map'
            }),

            new OpenLayers.Layer.XYZ('NationalMapLarge',
                'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/${z}/${y}/${x}', {
                sphericalMercator: true,
                isBaseLayer: true,
                attribution:'USGS - The National Map'
            }),
            new OpenLayers.Layer.Vector('Vector Layer') // not necessary
        ]
    });

    var proj = new OpenLayers.Projection('EPSG:4326');
    var mercator = new OpenLayers.Projection('EPSG:900913');
    var point = new OpenLayers.LonLat(-84.445, 33.7991);
    map.setCenter(point.transform(proj, mercator), 12);
}

$(document).ready(initializeMap);

function parseFeaturesIntoArray(queryResult) {

    var features = [];
    var options = {
        'internalProjection': map.baseLayer.projection, 
        'externalProjection': new OpenLayers.Projection('EPSG:4269')
    };   
    var parser = new OpenLayers.Format.WKT(options);

    //console.log(queryResult);

    for (i=0; i < queryResult['results']['bindings'].length; ++i) {
        for (var key in queryResult['results']['bindings'][i]) {
            if(queryResult['results']['bindings'][i][key]['datatype'] == "http://www.opengis.net/ont/geosparql#wktLiteral") {
                var wkt2 = queryResult['results']['bindings'][i][key]['value'];
                if (wkt2.split(/\>/)[1] != undefined) {
                    wkt2 = wkt2.split(/\>/)[1];
                }
                var feat = parser.read(wkt2);
                if (feat != undefined) {
                    features.push(feat);        
                }
            }
       }
    }

    return features;
}

// global variable so that extent contains all layers
var bounds = new OpenLayers.Bounds();
function findNewBounds(features) {

    for (i=0; i<features.length; ++i) {
        bounds.extend(features[i].geometry.getBounds()); 
    }
}

function hideAllVectorLayers() {
    for(var i = 0; i < vectorLayers.length; i++) {
        vectorLayers[i].setVisibility(false);
    }
}

function showAllVectorLayers() {
    for(var i = 0; i < vectorLayers.length; i++) {
        vectorLayers[i].setVisibility(true);
    }
}

function showOnlySelectedLayer(layerID) {
    for(var i = 0; i < vectorLayers.length; i++) {
        if(vectorLayers[i].features[0].id == layerID) {
            hideAllVectorLayers();
            vectorLayers[i].setVisibility(true);
            selectControl.select(vectorLayers[i].features[0]);
        }
    }
}

function drawVectors(features, vectorLayerStyle) {

    var newVectorLayer;

    if(vectorLayerStyle != null) { 
        newVectorLayer = new OpenLayers.Layer.Vector("styled vector layer", {styleMap: vectorLayerStyle});
    
    } else {
        newVectorLayer = new OpenLayers.Layer.Vector();
    }

    newVectorLayer.addFeatures(features);
    map.addLayer(newVectorLayer);

    findNewBounds(features);
    map.zoomToExtent(bounds);

    vectorLayers.push(newVectorLayer);

    selectControl = new OpenLayers.Control.SelectFeature(
        vectorLayers,
        {
            onSelect: function(event) { 
                hideAllVectorLayers();
                event.layer.setVisibility(true); 
            } ,
            onUnselect: function(event) { 
                showAllVectorLayers(); 
            }
            /* 
             clickout: true, toggle: false,
             multiple: false, hover: false,
             toggleKey: "ctrlKey", // ctrl key removes from selection
             multipleKey: "shiftKey" // shift key adds to selection
            */
        }
    );

    map.addControl(selectControl);
    selectControl.activate();
}

function drawVectorsForFeatures(resultMsg, featureID, featureFillColor) {

    var features = parseFeaturesIntoArray(resultMsg);
    
    // add layerID attribute to options in dropdown menus to enable 
    // selecting specific layers
    $('#featureResults1 > option[data-featureid="' + featureID + '"]').attr('data-layerid', features[0].id);
    $('#featureResults2 > option[data-featureid="' + featureID + '"]').attr('data-layerid', features[0].id);

    // create style object for features 
    var style = new OpenLayers.StyleMap({
        "default":new OpenLayers.Style(OpenLayers.Util.applyDefaults({
            fillColor: featureFillColor,
            strokeColor:"black",
            graphicName:"circle",
            rotation:0,
            pointRadius:10
        }, OpenLayers.Feature.Vector.style["default"])),
        "select":new OpenLayers.Style(OpenLayers.Util.applyDefaults({
            fillColor:"yellow",
            strokeColor:"black",
            graphicName:"circle",
            rotation:0,
            pointRadius:10
        }, OpenLayers.Feature.Vector.style["select"])),
        "highlight":new OpenLayers.Style(OpenLayers.Util.applyDefaults({
            fillColor:"yellow",
            strokeColor:"black",
            graphicName:"circle",
            rotation:0,
            pointRadius:10
        }, OpenLayers.Feature.Vector.style["highlight"]))
    });

    drawVectors(features, style);
}

function drawVectorsForSpatialRelationshipQuery(resultMsg) {

    var features = parseFeaturesIntoArray(resultMsg);

    // specific style for spatial relationship query results 

    drawVectors(features, null);
}

function drawVectorsForBinaryRelationshipQuery(resultMsg) {

    var features = parseFeaturesIntoArray(resultMsg);

    // specific style for binary relationship query results 

    drawVectors(features, null);
}

function submitquery(endpoint, query)
{
    var request = $.ajax({
    type: "GET",
    url: endpoint, //"http://geoquery.cs.jmu.edu:8081/parliament/sparql",
    dataType: "json",
    data: {
            "query": query,
            "output": "json"
        }
    });
    
    request.done(function( msg ) {
        var features = parseFeaturesIntoArray(msg);
        drawVectors(features, null);
        updateTable(msg, "tableWrap");
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert( "Request Failed: " + textStatus);
        alert(errorThrown + ": " + jqXHR.responseText);
    });
}

// custom code for pagination for index.html.erb
// borrowed from here: http://stackoverflow.com/questions/20896076/how-to-use-simplepagination-jquery
// mind the slight change below, personal idea of best practices
var customPagination = function(items, numItems, perPage, selector) {
    // consider adding an id to your table,
    // just incase a second table ever enters the picture..?

    // only show the first 2 (or "first per_page") items initially
    items.slice(perPage).hide();

    // now setup your pagination
    // you need that .pagination-page div before/after your table
    $(selector).pagination({
        items: numItems,
        itemsOnPage: perPage,
        onPageClick: function(pageNumber) { // this is where the magic happens
            // someone changed page, lets hide/show trs appropriately
            var showFrom = perPage * (pageNumber - 1);
            var showTo = showFrom + perPage;

            items.hide() // first hide everything, then show for the new page
                 .slice(showFrom, showTo).show();
        }
    });

    // EDIT: extra stuff to cover url fragments (i.e. #page-3)
    // https://github.com/bilalakil/bin/tree/master/simplepagination/page-fragment
    // is more thoroughly commented (to explain the regular expression)

    // we'll create a function to check the url fragment and change page
    // we're storing this function in a variable so we can reuse it
    var checkFragment = function() {
        // if there's no hash, make sure we go to page 1
        var hash = window.location.hash || "#page-1";

        // we'll use regex to check the hash string
        hash = hash.match(/^#page-(\d+)$/);

        if(hash)
            // the selectPage function is described in the documentation
            // we've captured the page number in a regex group: (\d+)
            $("#pagination").pagination("selectPage", parseInt(hash[1]));
    };

    // we'll call this function whenever the back/forward is pressed
    $(window).bind("popstate", checkFragment);

    // and we'll also call it to check right now!
    checkFragment();

};