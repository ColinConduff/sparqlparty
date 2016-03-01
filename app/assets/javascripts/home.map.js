// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

var map;
/* don't think these prefixes are used 
var prefixes = 
    " PREFIX owl: <http://www.w3.org/2002/07/owl#>\n \
PREFIX par: <http://parliament.semwebcentral.org/parliament#>\n \
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n \
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n \
PREFIX time: <http://www.w3.org/2006/time#>\n \
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n \
PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>\n \
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n \
PREFIX gnis: <http://cegis.usgs.gov/rdf/gnis/>\n \
PREFIX gnisf: <http://cegis.usgs.gov/rdf/gnis/Features/>\n \
PREFIX nhd: <http://cegis.usgs.gov/rdf/nhd/>\n \
PREFIX nhdf: <http://cegis.usgs.gov/rdf/nhd/Features/>\n \
PREFIX gu: <http://cegis.usgs.gov/rdf/gu/>\n \
PREFIX guf: <http://cegis.usgs.gov/rdf/gu/Features/>\n \
PREFIX category: <http://dbpedia.org/class/yago/>\n \
PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n \
PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n \
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>\n\n\n";
*/

function initializeMap() {

    var proj = new OpenLayers.Projection('EPSG:4326');
    var mercator = new OpenLayers.Projection('EPSG:900913');
    var maxExtent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
    restrictedExtent = maxExtent.clone(),
    maxResolution = 156543.0339;


    var options = {
        controls: [new OpenLayers.Control.PanZoomBar() ],
    	projection: new OpenLayers.Projection('EPSG:900913'),
    	displayProjection: new OpenLayers.Projection('EPSG:4326'),
    	units: 'm',
    	numZoomLevels: 18,
    	maxResolution: maxResolution,
    	maxExtent: maxExtent,
    	restrictedExtent: restrictedExtent,
    	layers: [
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
            new OpenLayers.Layer.OSM(), // open street map 
    	    new OpenLayers.Layer.Vector('Vector Layer') // not necessary
    	],
	   center:  new OpenLayers.LonLat(-84.445, 33.7991).transform(proj, mercator)
    };

    map = new OpenLayers.Map('map', options);

    // Add controls to map
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    var point = new OpenLayers.LonLat(-84.445, 33.7991);
    map.setCenter(point.transform(proj, mercator), 12);

}

$(document).ready(initializeMap);

function drawVectors(resultMsg) {
    var unexpectedResults = false;
    var features = new Array();
    var bounds = new OpenLayers.Bounds();
    var options = {
        'internalProjection': map.baseLayer.projection, 
        'externalProjection': new OpenLayers.Projection('EPSG:4269')
    };   
    var parser = new OpenLayers.Format.WKT(options);

    console.log(resultMsg);

    for (i=0; i < resultMsg['results']['bindings'].length; ++i) {
        for (var key in resultMsg['results']['bindings'][i]) {
            if(resultMsg['results']['bindings'][i][key]['datatype'] == "http://www.opengis.net/ont/geosparql#wktLiteral") {
                var wkt2 = resultMsg['results']['bindings'][i][key]['value'];
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
    
    for (i=0; i<features.length; ++i) {
        if(features[i].geometry == undefined) { 
            
            unexpectedResults = true; 
            break;

        } else {
            bounds.extend(features[i].geometry.getBounds());
        }   
    }

    if(unexpectedResults) {
        // sometimes a geometry collection or collection with no entries is returned
        // by a query which can't be used to draw a map layer
        alert("A map layer could not be created for this query's results.");
    }
    else {
        var newVectorLayer = new OpenLayers.Layer.Vector();
        newVectorLayer.addFeatures(features);
        map.addLayer(newVectorLayer);
        map.zoomToExtent(bounds);
    }
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
        drawVectors(msg);
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