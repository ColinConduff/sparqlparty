
function getFeatureTypes(selector)
{
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?type WHERE { ?feature rdf:type ?type . }";
    var endpoint = "http://geoquery.cs.jmu.edu:8081/parliament/sparql";

    var request = $.ajax({
    type: "GET",
    url: endpoint,
    dataType: "json",
    data: {
            "query": query,
            "output": "json"
        }
    });
    
    request.done(function( msg ) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
            $(selector).append("<option>" + arrayOfObjects[i].type.value + "</option>")
        }
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert( "Request Failed: " + textStatus);
        alert(errorThrown + ": " + jqXHR.responseText);
    });
}

function getFeatureRelationships(selector, selectedFeatureType)
{
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?rel WHERE { ?feature rdf:type <" + selectedFeatureType + "> ; ?rel ?obj . }";
    var endpoint = "http://geoquery.cs.jmu.edu:8081/parliament/sparql";
    
    var request = $.ajax({
    type: "GET",
    url: endpoint,
    dataType: "json",
    data: {
            "query": query,
            "output": "json"
        }
    });
    
    request.done(function( msg ) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
            $(selector).append("<option>" + arrayOfObjects[i].rel.value + "</option>")
        }
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert( "Request Failed: " + textStatus);
        alert(errorThrown + ": " + jqXHR.responseText);
    });
}

function getFeatureAndLabel(selector, feature, relationship, searchTerm)
{
    var query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT DISTINCT ?feature ?label WHERE { ?feature rdf:type <' + feature + '> . ?feature rdfs:label ?label . ?feature <' + relationship + '> ?obj . FILTER( regex(str(?obj), "' + searchTerm + '", "i" ) ) . }';
    var endpoint = "http://geoquery.cs.jmu.edu:8081/parliament/sparql";
    
    var request = $.ajax({
    type: "GET",
    url: endpoint,
    dataType: "json",
    data: {
            "query": query,
            "output": "json"
        }
    });
    
    request.done(function( msg ) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
          $(selector).append("<option featureID="+ arrayOfObjects[i].feature.value +">" + arrayOfObjects[i].label.value + "</option>");
          getFeatureWKTData(arrayOfObjects[i].feature.value);
        }
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert( "Request Failed: " + textStatus);
        alert(errorThrown + ": " + jqXHR.responseText);
    });
}

function getFeatureWKTData(selectedFeature)
{
    var query = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#> SELECT ?wkt WHERE { <' + selectedFeature + '> geo:hasGeometry ?g . ?g geo:asWKT ?wkt . }';
    var endpoint = "http://geoquery.cs.jmu.edu:8081/parliament/sparql";

    var request = $.ajax({
        type: "GET",
        url: endpoint,
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
