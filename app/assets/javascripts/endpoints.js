// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
/*
var map;
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


function init() {

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
	    new OpenLayers.Layer.ArcGIS93Rest('Orthoimagery',
					      'http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSImageryOnly/MapServer/export',
					      {
						  layers: "2"
					      }),
	    new OpenLayers.Layer.ArcGIS93Rest('Topo',
					     'http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/export', {}),
	    new OpenLayers.Layer.OSM(),
	    new OpenLayers.Layer.Vector('Vector Layer')
	],
	center:  new OpenLayers.LonLat(-84.445, 33.7991).transform(proj, mercator)
    };

    map = new OpenLayers.Map('map', options);

    // Add controls to map
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    var point = new OpenLayers.LonLat(-84.445, 33.7991);
    map.setCenter(point.transform(proj, mercator), 12);

}

$(document).ready(init);

function updateTable(resultMsg, tableDivId) {
    var container = $('#' + tableDivId);
    var tbl = $('<table>').attr('id', 'basicTable').attr("class", "resultTable");

    
    var $tr = $('<tr>').attr("class", "resultTable");
    for (var i = 0; i < resultMsg['head']['vars'].length; ++i) {
	$tr.append($('<th>').text(resultMsg['head']['vars'][i]));
    }
    tbl.append($tr);

    for (var j=0; j < resultMsg['results']['bindings'].length; ++j) {
        $tr = $('<tr>').attr("class", "resultTable");
        for (var key in resultMsg['results']['bindings'][j]) {
            var td = $('<td>').attr('class', 'resultCell');
            td.text(resultMsg['results']['bindings'][j][key].value);
            $tr.append(td);
        }
        tbl.append($tr);
    }
    
    container.empty();
    container.append(tbl);

}

function drawVectors(resultMsg, matchString, olmap) {
    var features = new Array();
    var bounds = new OpenLayers.Bounds();
    var options = {
        'internalProjection': map.baseLayer.projection, 
        'externalProjection': new OpenLayers.Projection('EPSG:4269')
    };   
    var parser = new OpenLayers.Format.WKT(options);
    var vectorLayer = map.getLayersByName("Vector Layer")[0];

    if (vectorLayer == undefined) {
	return;
    }

    vectorLayer.removeAllFeatures();

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
	bounds.extend(features[i].geometry.getBounds());   
    }

    vectorLayer.addFeatures(features);
    map.zoomToExtent(bounds);
}

function setQuery(input) {
	//$('#queryTextArea').value = $('#queryText1');
        $('#queryTextArea').val(prefixes + $('#queryText' + input.name).attr('value'));
}

function submitquery()
{

    var request = $.ajax({
			     type: "GET",
                             url: window.sparqlURL,
			     dataType: "json",
                             data: {
                                 "query": $("#queryTextArea").val(),
                                 "output": "json"
                             }
                         });
    
    request.done(function( msg ) {
		     drawVectors(msg, "wkt", map);
                     updateTable(msg, "tableWrap");
                 });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
                     alert( "Request Failed: " + textStatus);
		     alert(errorThrown + ": " + jqXHR.responseText);
		     
                 });
}

*/