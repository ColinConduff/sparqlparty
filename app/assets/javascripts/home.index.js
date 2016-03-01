$( document ).ready(function() {
    
  // hide dropdown/select menus until data is queried
  $('.featureRelationships1').hide();
  $('#searchBar1').hide();
  $('.featureSearch1').hide();
  $('.featureResults1').hide();
  $('.displayAttributesBtn1').hide();
  
  $('.toggleFeatureOptions1').hide();
  $('.featureOptions1').hide();
  $('.buffer1').hide();

  var bufferTextFieldHidden1 = true;

  $('.toggleFeatureOptions1').click(function() {
    if(!bufferTextFieldHidden1) {
      $('.buffer1').hide();
      bufferTextFieldHidden1 = true;
    }
    $('.featureOptions1').toggle();
  });

  $('#bufferRadio1').click(function() {
    $('.buffer1').show();
    bufferTextFieldHidden1 = false;
  });

  $('#noneRadio1').click(function() {
    $('.buffer1').hide();
    bufferTextFieldHidden1 = true;
  });

  $('#boundaryRadio1').click(function() {
    $('.buffer1').hide();
    bufferTextFieldHidden1 = true;
  });

  // feature two stuff
  $('.menuGrouping2').hide();
  $('.featureTypes2').hide();
  $('.featureRelationships2').hide();
  $('#searchBar2').hide();
  $('.featureSearch2').hide();
  $('.featureResults2').hide();
  $('.displayAttributesBtn2').hide();

  $('.toggleFeatureOptions2').hide();
  $('.featureOptions2').hide();
  $('.buffer2').hide();

  var bufferTextFieldHidden2 = true;

  $('.toggleFeatureOptions2').click(function() {
    if(!bufferTextFieldHidden2) {
      $('.buffer2').hide();
      bufferTextFieldHidden2 = true;
    }
    $('.featureOptions2').toggle();
  });

  $('#bufferRadio2').click(function() {
    $('.buffer2').show();
    bufferTextFieldHidden2 = false;
  });

  $('#noneRadio2').click(function() {
    $('.buffer2').hide();
    bufferTextFieldHidden2 = true;
  });

  $('#boundaryRadio2').click(function() {
    $('.buffer2').hide();
    bufferTextFieldHidden2 = true;
  });

  $('.menuGrouping3').hide();
  $('.spatialRelationshipGroup').hide();

  $('.menuGrouping4').hide();
  $('.binaryGroup').hide();

  // get the types of all of the features in the dataset
  getFeatureTypes('.featureTypes1');

  var selectedFeatureType1 = "";

  // when a feature type is selected, get all of the relationships related
  // to that feature type
  $(".featureTypes1").change(function () {
    selectedFeatureType1 = $('.featureTypes1').children(':selected').text();
    getFeatureRelationships('.featureRelationships1', selectedFeatureType1);
    $('.featureRelationships1').show();
    $('#searchBar1').show();
    $('.toggleFeatureOptions1').show();
    $('.featureSearch1').show();
  });

  // when the search button is clicked,
  // use all of the user specified information to find all of the feature URIs
  // and lables in the dataset matching the user's specifications
  $('.featureSearch1').click(function(){
    var selectedFeatureRel = $('.featureRelationships1').children(':selected').text();
    var searchTerm = $('#searchBar1').val();
    var withBoundary = false;
    var bufferValue = null;
    if($('#boundaryRadio1').is(':checked')) { withBoundary = true; }
    if($('#bufferRadio1').is(':checked')) { bufferValue = $('.buffer1').val(); }
    
    getFeatureAndLabel('.featureResults1', selectedFeatureType1, selectedFeatureRel, searchTerm, '.featuresForSpatial1', '.featuresForBinary1', withBoundary, bufferValue);
    $('.featureResults1').show();

    $('.menuGrouping2').show();
    $('.featureTypes2').show();
    getFeatureTypes('.featureTypes2');
  });

  // find one feature's attribute data and fill a table with that data
  $(".featureResults1").change(function () {
    var selectedFeature = $('.featureResults1').children(':selected').attr('featureID');
    var selectedLabel = $('.featureResults1').children(':selected').text();
    var attributeTableTarget = '.featureAttributesList1';
    var attributeModalTitle = '.attributeModalTitle1';
    getFeatureAttributes(selectedFeature, selectedLabel, attributeTableTarget, attributeModalTitle);
    $('.displayAttributesBtn1').show();
  });

  // beginning feature 2 //////////////////////////////
  // do all of the same stuff for the second feature

  var selectedFeatureType2 = "";

  $(".featureTypes2").change(function () {
    selectedFeatureType2 = $('.featureTypes2').children(':selected').text();
    getFeatureRelationships('.featureRelationships2', selectedFeatureType2);
    $('.featureRelationships2').show();
    $('#searchBar2').show();
    $('.toggleFeatureOptions2').show();
    $('.featureSearch2').show();
  });

  $('.featureSearch2').click(function(){
    var selectedFeatureRel = $('.featureRelationships2').children(':selected').text();
    var searchTerm = $('#searchBar2').val();
    var withBoundary = false;
    var bufferValue = null;
    if($('#boundaryRadio2').is(':checked')) { withBoundary = true; }
    if($('#bufferRadio2').is(':checked')) { bufferValue = $('.buffer2').val(); }

    getFeatureAndLabel('.featureResults2', selectedFeatureType2, selectedFeatureRel, searchTerm, '.featuresForSpatial2', '.featuresForBinary2', withBoundary, bufferValue);
    $('.featureResults2').show();

    $('.menuGrouping3').show();
    $('.spatialRelationshipGroup').show();
    $('.spatialResultsModalBtn').hide();

    $('.menuGrouping4').show();
    $('.binaryGroup').show();
    $('.binaryResultsModalBtn').hide();
  });

  $(".featureResults2").change(function () {
    var selectedFeature = $('.featureResults2').children(':selected').attr('featureID');
    var selectedLabel = $('.featureResults2').children(':selected').text();
    var attributeTableTarget = '.featureAttributesList2';
    var attributeModalTitle = '.attributeModalTitle2';
    getFeatureAttributes(selectedFeature, selectedLabel, attributeTableTarget, attributeModalTitle);
    $('.displayAttributesBtn2').show();
  });

  $(".startSpatialRelBtn").click(function () {

    // available operations
    // sfWithin, sfEquals, sfContains, sfDisjoint, sfIntersects, sfOverlaps, sfTouches
    // ehEquals, ehDisjoint, ehMeet, ehOverlap, ehCovers, ehCoverdBy, ehInside, ehContains

    var feature1 = $('.featuresForSpatial1').children(':selected').attr('featureSpatialID');
    var feature2 = $('.featuresForSpatial2').children(':selected').attr('featureSpatialID');
    var operation = $('.availableOperationsForSpatial').children(':selected').text();

    if(feature1 == "all" && feature2 == "all")
    {
      var feature1Type = selectedFeatureType1;
      var feature1Relationship = $('.featureRelationships1').children(':selected').text();
      var feature1SearchTerm = $('#searchBar1').val();

      var feature2Type = selectedFeatureType2;
      var feature2Relationship = $('.featureRelationships2').children(':selected').text();
      var feature2SearchTerm = $('#searchBar2').val();

      getSpatialRelationshipResultsOfManyToMany(feature1Type, feature1Relationship, feature1SearchTerm, feature2Type, feature2Relationship, feature2SearchTerm, operation);
    }
    else if (feature1 == "all" && feature2 != "all")
    {
      var feature1Type = selectedFeatureType1;
      var feature1Relationship = $('.featureRelationships1').children(':selected').text();
      var feature1SearchTerm = $('#searchBar1').val();
      
      getSpatialRelationshipResultsOfManyToOne(feature1Type, feature1Relationship, feature1SearchTerm, feature2, operation);
    }
    else if (feature1 != "all" && feature2 == "all")
    {
      var feature2Type = selectedFeatureType2;
      var feature2Relationship = $('.featureRelationships2').children(':selected').text();
      var feature2SearchTerm = $('#searchBar2').val();
      
      getSpatialRelationshipResultsOfManyToOne(feature2Type, feature2Relationship, feature2SearchTerm, feature1, operation);
    }
    else if (feature1 != "all" && feature2 != "all")
    {
      getSpatialRelationshipResultsOf2Features(feature1, feature2, operation);
    }
    else
    {
      alert("error!");
    }

    $('.spatialResultsModalBtn').show();
  });

  var spatialOperandsReversed = false;

  $('.reverseSpatialOperands').click(function () {
    if(spatialOperandsReversed) {
      $(".featuresForSpatial2").detach().appendTo('.spatialOperand2');
      $(".featuresForSpatial1").detach().appendTo('.spatialOperand1');
      spatialOperandsReversed = false;
    } else {
      $(".featuresForSpatial2").detach().appendTo('.spatialOperand1');
      $(".featuresForSpatial1").detach().appendTo('.spatialOperand2');
      spatialOperandsReversed = true;
    }
  });

  $(".startBinaryBtn").click(function () {

    var feature1 = $('.featuresForBinary1').children(':selected').attr('featureBinaryID');
    var feature2 = $('.featuresForBinary2').children(':selected').attr('featureBinaryID');
    var binaryOperation = $('.availableOperationsForBinary').children(':selected').text();

    getBinarySpatialDataOfTwoFeaturesAndDrawVectors(feature1, feature2, binaryOperation);

    $('.binaryResultsModalBtn').show();
  });
});