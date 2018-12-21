///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom-construct',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'jimu/dijit/GridLayout',
  "esri/request", 
  "dojo/_base/array"
],
function(declare, 
		 lang, 
		 on, 
		 domConstruct, 
		 _WidgetsInTemplateMixin, 
		 BaseWidgetSetting, 
		 GridLayout,
		 esriRequest, 
		 array
		 ) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-imageservicecombine-setting',
    layout: null,

    postCreate: function() {
      this.inherited(arguments);

      this._initLayout();
	 
	  console.log(this.config);
	  
	  		  array.forEach(this.config.ImageServices, lang.hitch(this,function(entry, i){
				//console.debug(entry, "at index", i);
				
						  var ImageServiceUrl = entry.url;
						  var ImageServiceRequest = esriRequest({
							url: ImageServiceUrl,
							content: { f: "json" },
							handleAs: "json",
							callbackParamName: "callback"
						  });
						  ImageServiceRequest.then(
							lang.hitch(this,function(response) {
							  entry.info = response;
							  console.log("Success: ", response, entry);
							  
							  if (response.hasMultidimensions == true) {

							  		
										  var ImageServiceMDRequest = esriRequest({
											url: ImageServiceUrl + "/multiDimensionalInfo",
											content: { f: "json" },
											handleAs: "json",
											callbackParamName: "callback"
										  });
										  ImageServiceMDRequest.then(
											lang.hitch(this,function(response) {
											  entry.multidimensionalInfo = response.multidimensionalInfo;
											  console.log("Success 2: ", response, entry);
											  //this.returnedServices = this.returnedServices + 1;
											}));
											
										  var ImageServiceDimsRequest = esriRequest({
											url: ImageServiceUrl + "/query",
											content: { f: "json" , outFields: "Tag,Dimensions,Variable", returnDistinctValues: true, returnGeometry: false},
											handleAs: "json",
											callbackParamName: "callback"
										  });
										  ImageServiceDimsRequest.then(
											lang.hitch(this,function(response) {
											  entry.dimensions = response.features;
											  console.log("Success 3: ", response, entry);
											  this.returnedServices = this.returnedServices + 1;
											}));
							  
							  } else {
								
								  var ImageServiceDimsRequest = esriRequest({
									url: ImageServiceUrl + "/query",
									content: { f: "json" , outFields: "Tag", returnDistinctValues: true, returnGeometry: false},
									handleAs: "json",
									callbackParamName: "callback"
								  });
								  ImageServiceDimsRequest.then(
									lang.hitch(this,function(response) {
									  entry.dimensions = response.features;
									  console.log("Success 3: ", response, entry);
									  this.returnedServices = this.returnedServices + 1;
									}));								
								  
							  }
							  
						  }), function(error) {
							  console.log("Error: ", error.message);
						  });
				
				
		  }));

    },
	
	setConfig: function(config){
      // Update header text
	  console.log('setconfig',config);
      //this.headerTextNode.value = config.widgetHeaderText;
	},
	
	getConfig: function(){
      console.log('getconfig')
      return this.config;
    },

    destroy: function() {
      this.inherited(arguments);
      //this.layout.destroy();
    },

    _initLayout: function() {

    }
  });
});