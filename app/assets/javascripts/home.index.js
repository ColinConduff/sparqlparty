
function baseQueryRequest(query, ifSuccessfulDoThis)
{
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
        ifSuccessfulDoThis(msg);
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert( "Request Failed: " + textStatus);
        alert(errorThrown + ": " + jqXHR.responseText);
    });
}

function getFeatureTypes(selector)
{
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?type WHERE { ?feature rdf:type ?type . }";
    
    var willDoThisUponSuccessfulQuery = function(msg) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
            $(selector).append("<option>" + arrayOfObjects[i].type.value + "</option>")
        }
    };

    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
    
}

function getFeatureRelationships(selector, selectedFeatureType)
{
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?rel WHERE { ?feature rdf:type <" + selectedFeatureType + "> ; ?rel ?obj . }";
    
    var willDoThisUponSuccessfulQuery = function(msg) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
            $(selector).append("<option>" + arrayOfObjects[i].rel.value + "</option>")
        }
    };
    
    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getFeatureAndLabel(selector, feature, relationship, searchTerm, selectorForSpatial)
{
    var query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT DISTINCT ?feature ?label WHERE { ?feature rdf:type <' + feature + '> . ?feature rdfs:label ?label . ?feature <' + relationship + '> ?obj . FILTER( regex(str(?obj), "' + searchTerm + '", "i" ) ) . }';

    var willDoThisUponSuccessfulQuery = function(msg) {
        var arrayOfObjects = msg.results.bindings;

        for(var i = 0; i < arrayOfObjects.length; i++)
        {
          $(selector).append("<option featureID="+ arrayOfObjects[i].feature.value +">" + arrayOfObjects[i].label.value + "</option>");
          $(selectorForSpatial).append("<option featureSpatialID="+ arrayOfObjects[i].feature.value +">" + arrayOfObjects[i].label.value + "</option>");
          getFeatureWKTData(arrayOfObjects[i].feature.value);
        }
    };
    
    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getFeatureWKTData(selectedFeature)
{
    var query = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#> SELECT ?wkt WHERE { <' + selectedFeature + '> geo:hasGeometry ?g . ?g geo:asWKT ?wkt . }';
    
    var willDoThisUponSuccessfulQuery = function(msg) {
        drawVectors(msg);
        updateTable(msg, "tableWrap");
    };
    
    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getFeatureAttributes(selectedFeature, selectedLabel, attributeTableTarget, attributeModalTitle)
{
    var query = 'SELECT ?rel ?obj WHERE { <' + selectedFeature + '> ?rel ?obj . }'
    
    var willDoThisUponSuccessfulQuery = function(msg) {
        var featureAttributes = msg.results.bindings;

        $(attributeTableTarget+' > tbody').empty();

        for(var i = 0; i < featureAttributes.length; i++)
        {
            var type = featureAttributes[i].obj.type;
            var val = featureAttributes[i].obj.value;
            var uri = featureAttributes[i].rel.value;

            $(attributeTableTarget+' > tbody:last-child').append('<tr><td>' + uri + '</td><td>' + type + ' : ' + val + '</td></tr>');
        }

        $(attributeModalTitle).empty();
        $(attributeModalTitle).append('<h4 class="modal-title">' + selectedLabel + '</h4>');
    };
    
    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getSpatialRelationshipResultsOfManyToOne(feature1Type, feature1Relationship, feature1SearchTerm, feature2, operation)
{
    var query = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> SELECT DISTINCT ?feature ?label WHERE { ?feature rdf:type <' + feature1Type + '> . ?feature rdfs:label ?label . ?feature <' + feature1Relationship +'> ?obj1 . FILTER( regex(str(?obj1), "' + feature1SearchTerm + '", "i" ) ) . ?feature geo:hasGeometry ?g1 . ?g1 geo:asWKT ?wkt1 . <' + feature2 + '> geo:hasGeometry ?g2 . ?g2 geo:asWKT ?wktf2 . BIND(?wktf2 AS ?wkt2) . FILTER (geof:' + operation + '(?wkt1, ?wkt2)) .}';
    var willDoThisUponSuccessfulQuery = function(msg) { 
        updateTable(msg, 'spatialRelResultsTable');
    }

    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getSpatialRelationshipResultsOf2Features(feature1, feature2, operation)
{
    var query = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> SELECT DISTINCT ?feature ?label WHERE { <' + feature1 + '> geo:hasGeometry ?g1 . ?g1 geo:asWKT ?wktf1 . BIND(?wktf1 AS ?wkt1) . <' + feature2 + '> geo:hasGeometry ?g2 . ?g2 geo:asWKT ?wktf2 . BIND(?wktf2 AS ?wkt2) . FILTER (geof:' + operation + '(?wkt1, ?wkt2)) .}';
    var willDoThisUponSuccessfulQuery = function(msg) { 
        updateTable(msg, 'spatialRelResultsTable');
    }

    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}

function getSpatialRelationshipResultsOfManyToMany(feature1Type, feature1Relationship, feature1SearchTerm, feature2Type, feature2Relationship, feature2SearchTerm, operation)
{
    var query = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> SELECT DISTINCT ?feature ?label WHERE { ?feature rdf:type <' + feature1Type + '> . ?feature rdfs:label ?label . ?feature <' + feature1Relationship +'> ?obj1 . FILTER( regex(str(?obj1), "' + feature1SearchTerm + '", "i" ) ) . ?feature geo:hasGeometry ?g1 . ?g1 geo:asWKT ?wkt1 . ?feature2 rdf:type <' + feature2Type + '> . ?feature2 rdfs:label ?label2 . ?feature2 <' + feature2Relationship +'> ?obj2 . FILTER( regex(str(?obj2), "' + feature2SearchTerm + '", "i" ) ) . ?feature2 geo:hasGeometry ?g2 . ?g2 geo:asWKT ?wkt2 . FILTER (geof:' + operation + '(?wkt1, ?wkt2)) .}';
    var willDoThisUponSuccessfulQuery = function(msg) { 
        updateTable(msg, 'spatialRelResultsTable');
    }

    baseQueryRequest(query, willDoThisUponSuccessfulQuery);
}
