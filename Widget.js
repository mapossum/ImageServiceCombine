define(['dojo/_base/declare', 
		'jimu/BaseWidget',
		"dojo/query",
		"dojo/dom-attr",
		"esri/layers/ArcGISImageServiceLayer", 
        "esri/layers/ImageServiceParameters", 
		"esri/layers/MosaicRule", 
		"esri/layers/RasterFunction", 
		"dojox/form/RangeSlider", 
		"dijit/form/Select",
		"dojo/parser", 
		"dojo/_base/lang", 
		"esri/request", 
		"dojo/_base/array",
		//"jimu/dijit/TabContainer3",
		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		"dojo/dom-construct",
		'./noUiSlider/nouislider'
		],
  function(declare, 
		   BaseWidget, 
		   query,
		   attr,
		   ArcGISImageServiceLayer, 
		   ImageServiceParameters, 
		   MosaicRule, 
		   RasterFunction, 
		   HorizontalRangeSlider, 
		   Select,
		   parser, 
		   lang, 
		   esriRequest, 
		   array,
		   TabContainer,
		   ContentPane,
		   domConstruct,
		   noUiSlider	   
		   ) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here

      baseClass: 'jimu-widget-imageservicecombine',

      //this property is set by the framework when widget is loaded.
      name: 'CustomWidget',
	  returnedServices: 0,


      //methods to communication with app container:

      // postCreate: function() {
      //   this.inherited(arguments);
      //   console.log('postCreate');
      // },

       startup: function() {
        this.inherited(arguments);
        //this.mapIdNode.innerHTML = 'map id:' + this.map.id;
        
		console.log('startup');
		console.log(this.config);
		
		
		array.forEach(this.config.ImageServices, lang.hitch(this,function(entry, i){
			
			
			
			if (entry.info.hasMultidimensions) {
			
					
										  var ImageServiceMDRequest = esriRequest({
											url: entry.url + "/multiDimensionalInfo",
											content: { f: "json" },
											handleAs: "json",
											callbackParamName: "callback"
										  });
										  ImageServiceMDRequest.then(
											lang.hitch(this,function(response) {
											  entry.multidimensionalInfo = response.multidimensionalInfo;
											  console.log("MD Success: ", response, entry);
											  var taber = query(".tc1cp");
											  
											  domConstruct.create("span", { innerHTML: "<b>" + entry.label + ":</b><br>" }, taber[0]);
											  
											  
											  //build drop down boxes for each 
											  array.forEach(entry.multidimensionalInfo.variables, lang.hitch(this,function(vars, i){
												  if (vars.name == entry.variableName) {
														console.log(vars.dimensions);
														array.forEach(vars.dimensions, lang.hitch(this,function(dims, i){
															
																
																var inoptions = new Array();
																
																array.forEach(dims.values, lang.hitch(this,function(vals, i){
																	if (dims.name == 'StdTime') {
																		var dd = new Date(vals)
																		console.log(dd.toUTCString());
																		inoptions.push({label: dd.toUTCString(), value: vals})
																	} else {
																	if (vals == 0) {sel = true} else {sel = false}
																		inoptions.push({label: vals.toString(), value: vals.toString(), selected: sel})
																	}
																}));
																
																domConstruct.create("span", { innerHTML: " " + dims.name + ": " }, taber[0]);
																
															    var s = new Select({
																	name: "select2",
																	//style: "width:100px",
																	options: inoptions
																}).placeAt(taber[0]).startup();
																
																
															
															
														}));
												  }
											  }));
											  
											  domConstruct.create("br", null, taber[0]);
											  domConstruct.create("hr", null, taber[0]);
											  
											}));
			} else {
			
			
			}
			
		}));	

var node = query("#red");
    noUiSlider.create(node[0], {
		start: [300, 700],
        range: {
            'min': 0,
            'max': 1000
        }
    });		
	
node[0].noUiSlider.on('update', function (values, handle) {
    console.log(values);
});	

		
/* 		  array.forEach(this.config.ImageServices, lang.hitch(this,function(entry, i){
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
											  this.returnedServices = this.returnedServices + 1;
											}));
							  
							  } else {
								
								this.returnedServices = this.returnedServices + 1;
								  
							  }
							  
						  }), function(error) {
							  console.log("Error: ", error.message);
						  });
				
				
		  })); */
		
		
        var params = new ImageServiceParameters();
        params.noData = 0;

		//var mr = new MosaicRule(this.config.ImageServices[0].mosaicRule);
		//params.mosaicRule = mr;	

        var imageServiceLayer = new ArcGISImageServiceLayer(this.config.ImageServices[0].url, {
          imageServiceParameters: params,
          opacity: 0.75
        });
        this.map.addLayer(imageServiceLayer);	

		
		rfout = new RasterFunction();
		rfout.functionName = "Remap";
		rfout.functionArguments = {
		  "InputRanges" : [-9999,35,35,36,36,700],
		  "OutputValues" : [1,100,250],
		  "Raster" : "$1" //"$$"
		};
		rfout.variableName = "riskOutput";
		rfout.outputPixelType = "U8";	


		colorRF = new RasterFunction();
		colorRF.functionName = "Colormap";
		colorRF.variableName = "riskOutput";
		colorRF.functionArguments = {
		  "Colormap" : [[1,255,0,0],[100,255,255,0],[250,0,255,0]],
		  "Raster" : rfout  //use the output of the remap rasterFunction for the Colormap rasterFunction
		};		
		
		imageServiceLayer.setRenderingRule(colorRF);	

		thing = this;

		  var rangeSlider = new dojox.form.HorizontalRangeSlider({
			name: "rangeSlider",
			value: [35,36],
			minimum: 34,
			maximum: 37,
			intermediateChanges: false,
			style: "width:300px;",
			onChange: function(value) {thing.changeSlider(value, imageServiceLayer)}
		  }, "rangeSlider");

		parser.parse();		
		
       },
	   
	   changeSlider(value, ims) {
		  
	       
		 console.log(value);  
			rfout = new RasterFunction();
			rfout.functionName = "Remap";
			rfout.functionArguments = {
			  "InputRanges" : [-9999,value[0],value[0],value[1],value[1],700],
			  "OutputValues" : [1,100,250],
			  "Raster" : "$1"
			};
			rfout.variableName = "riskOutput";
			rfout.outputPixelType = "U8";	


			colorRF = new RasterFunction();
			colorRF.functionName = "Colormap";
			colorRF.variableName = "riskOutput";
			colorRF.functionArguments = {
			  "Colormap" : [[1,255,0,0],[100,255,255,0],[250,0,255,0]],
			  "Raster" : rfout  //use the output of the remap rasterFunction for the Colormap rasterFunction
			};		
			
			ims.setRenderingRule(colorRF);	
		 
		 console.log('slider', this.returnedServices);
	   },

       onOpen: function(){
         console.log('onOpen', this.returnedServices);

	    query(".tc1cp").forEach(function(n){
        new ContentPane({
            // just pass a title: attribute, this, we're stealing from the node
            title: attr.get(n, "title")
        }, n);
    });
    var tc = new TabContainer({
        style: attr.get("tc1-prog", "style")
    }, "tc1-prog");
    tc.startup();	
		 
       },

      // onClose: function(){
      //   console.log('onClose');
      // },

      // onMinimize: function(){
      //   console.log('onMinimize');
      // },

      // onMaximize: function(){
      //   console.log('onMaximize');
      // },

      // onSignIn: function(credential){
      //   /* jshint unused:false*/
      //   console.log('onSignIn');
      // },

      // onSignOut: function(){
      //   console.log('onSignOut');
      // }

      // onPositionChange: function(){
      //   console.log('onPositionChange');
      // },

      // resize: function(){
      //   console.log('resize');
      // }

      //methods to communication between widgets:

    });
  });