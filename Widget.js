define(['dojo/_base/declare', 
		'jimu/BaseWidget',
		"dojo/query",
		"dojo/dom-attr",
		"esri/layers/ArcGISImageServiceLayer", 
        "esri/layers/ImageServiceParameters", 
		"esri/layers/MosaicRule", 
		"esri/layers/RasterFunction", 
		"esri/geometry/Extent",
		"esri/SpatialReference",
		"dojox/form/RangeSlider", 
		"dijit/form/Select",
		"dojo/parser", 
		"dojo/_base/lang", 
		"esri/request", 
		"dojo/_base/array",
		//"jimu/dijit/TabContainer3",
		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		"dijit/form/CheckBox",
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
		   SpatialReference,
		   Extent,
		   HorizontalRangeSlider, 
		   Select,
		   parser, 
		   lang, 
		   esriRequest, 
		   array,
		   TabContainer,
		   ContentPane,
		   CheckBox,
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
		
		  var spatialRef = new SpatialReference({ wkid:4326 });
		  var startExtent = new Extent();
		  startExtent.xmin = -124.71;
		  startExtent.ymin = 31.89;
		  startExtent.xmax = -113.97;
		  startExtent.ymax = 42.63;
		  startExtent.spatialReference = spatialRef;

		  //this.map.setExtent(startExtent);
		
		
		array.forEach(this.config.ImageServices, lang.hitch(this,function(entry, i){
			
			var taber = query(".tc1cp");
			
			var params = new ImageServiceParameters();
			params.noData = 0;

			//var mr = new MosaicRule(this.config.ImageServices[0].mosaicRule);
			//params.mosaicRule = mr;	

			entry.imageServiceLayer = new ArcGISImageServiceLayer(entry.url, {
			  imageServiceParameters: params,
			  opacity: 0.60
			});
			this.map.addLayer(entry.imageServiceLayer);	
			entry.imageServiceLayer.setVisibility(false);
			
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
											  
											  
											  domConstruct.create("span", { class: "imagesHeader", innerHTML: "<b>" + entry.label + ":</b><br>" }, taber[0]);
											  
											  
											  //build drop down boxes for each 
											  array.forEach(entry.multidimensionalInfo.variables, lang.hitch(this,function(vars, i){
												  if (vars.name == entry.variableName) {
														console.log(vars.dimensions);
														array.forEach(vars.dimensions, lang.hitch(this,function(dims, i){
															
																
																var inoptions = new Array();
																
																array.forEach(dims.values, lang.hitch(this,function(vals, i){
																	if (dims.name == 'StdTime') {
																		var dd = new Date(vals)
																		//console.log(dd.toUTCString());
																		inoptions.push({label: dd.toUTCString(), value: vals})
																	} else {
																	if (vals == 0) {sel = true} else {sel = false}
																		inoptions.push({label: vals.toString(), value: vals.toString(), selected: sel})
																	}
																}));
																
																domConstruct.create("span", { innerHTML: " " + this.checkDic(dims.description) + ": " }, taber[0]);
																
															    dims.sel = new Select({
																	name: "select2",
																	//style: "width:100px",
																	class: "isdd",
																	options: inoptions,
																	onChange: lang.hitch(this,function(b){console.log(this, b, dims.name, entry.label); this.updateISData(entry.label) })
																})
																
																dims.sel.placeAt(taber[0]).startup();
																if (dims.name != 'StdTime') {
																	domConstruct.create("span", { innerHTML: " " + this.checkDic(dims.unit) }, taber[0]);
																}
																domConstruct.create("br", null, taber[0]);
																
																
															
															
														}));
												  }
											  }));
											  
											  domConstruct.create("br", null, taber[0]);
											  domConstruct.create("hr", null, taber[0]);
											  
											  this.updateISData(entry.label)
											  
											}));
			} else {
					
					domConstruct.create("span", { class: "imagesHeader", innerHTML: "<b>" + entry.label + ":</b> Not Multidimentional<hr>" }, taber[0]);
			
			}
			
				var checkBox = new CheckBox({
				name: "checkBox",
				value: "agreed",
				checked: false,
				onChange: lang.hitch(this,function (b) {console.log("check", entry, b);  entry.viz = b; this.updateMap(entry);})
			}).placeAt(taber[1]).startup();
			
			controlDom = domConstruct.create("span", { }, taber[1]);
			
			domConstruct.create("span", { innerHTML: " " + entry.label + " " }, controlDom);
			domConstruct.create("span", {style: "float:right" , innerHTML: "  Values: <input class='minValue " + entry.variableName +"Values' type='text' style='width:40px' name='fname'> <input class='maxValue " + entry.variableName + "Values' type='text' style='width:40px' name='fname'>" }, controlDom);
			
			

			entry.sliderValues = [300, 700];
			
			var node = domConstruct.create("div", {class: "sliders" }, taber[1]);
			
				noUiSlider.create(node, {
					start: entry.sliderValues,
					connect: [true, true, true],
					range: {
						'min': 0,
						'max': 1000
					}
				});		
			
			var connect = node.querySelectorAll('.noUi-connect');			
			var classes = ['c-1-color', 'c-2-color', 'c-3-color'];

			for (var i = 0; i < connect.length; i++) {
				connect[i].classList.add(classes[i]);
			}

			node.noUiSlider.on('change', lang.hitch(this,function (values, handle) {
				console.log(this, values, entry.label);
				entry.sliderValues = values;
				//need to fix this so that it changes only on stop
				this.updateMap(entry);
			}));				
			
			domConstruct.create("span", {class: "cutoffs" + entry.label , innerHTML:""}, taber[1]);
			//domConstruct.create("br", null, taber[1]);
    		domConstruct.create("hr", null, taber[1]);
			
			
			
		}));	



		
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
				
				
		  })); 
		
		
        var params = new ImageServiceParameters();
        params.noData = 0;

		//var mr = new MosaicRule(this.config.ImageServices[0].mosaicRule);
		//params.mosaicRule = mr;	

        var imageServiceLayer = new ArcGISImageServiceLayer(this.config.ImageServices[0].url, {
          imageServiceParameters: params,
          opacity: 0.75
        });
        //this.map.addLayer(imageServiceLayer);	

		
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
*/
	//	  var rangeSlider = new dojox.form.HorizontalRangeSlider({
	//		name: "rangeSlider",
	//		value: [35,36],
	//		minimum: 34,
	//		maximum: 37,
	//		intermediateChanges: false,
	//		style: "width:300px;",
	//		onChange: function(value) {thing.changeSlider(value, imageServiceLayer)}
	//	  }, "rangeSlider");

	//	parser.parse();		

       },
	   
	   checkDic(instr) {
		   
		   mystr = this.config.masterDictionary[instr];
		  if (mystr == undefined) {
		   return instr 
		  } else {
		   return mystr
		  }
	   },
	   
	   updateISData(label) {
		   
		   contentobject = {where: "", f: "json", returnGeometry: false};
		   array.forEach(this.config.ImageServices, lang.hitch(this,function(entry, i){
			   if (label == "") {label = entry.label}
			   if (entry.label == label) {

										var reqContent = { f: "json" , returnGeometry: false }
										if (entry.info.hasMultidimensions) {
											array.forEach(entry.multidimensionalInfo.variables, lang.hitch(this,function(vars, i){
												if (vars.name == entry.variableName) {
													array.forEach(vars.dimensions, lang.hitch(this,function(dims, i){
														console.log("dims: ", dims.name, dims.sel.value)
														if (dims.name == "StdTime") {contentobject.time = dims.sel.value} else {
															contentobject.where = contentobject.where + dims.name + " = " + dims.sel.value + " AND ";
														}
													}));
												}
											}));
											
										}
										
										contentobject.where = contentobject.where + "Tag = '" + entry.variableName + "'"
										console.log(contentobject)
			   							var ImageServiceQRequest = esriRequest({
											url: entry.url + "/query",
											//content: { f: "json" , returnGeometry: false, where: "StdZ = 0 AND Tag = 'salinity'", time: '1537552800000'},
											content: contentobject,
											handleAs: "json",
											callbackParamName: "callback"
										  });
										  ImageServiceQRequest.then(
											lang.hitch(this,function(response) {
											  entry.currentFID = response.features[0].attributes[response.fields[0].name];
											  console.log("Success Q: ", response, response.features[0].attributes[response.fields[0].name], entry);
												    geom = JSON.stringify(entry.imageServiceLayer.fullExtent);
													mr = '{"mosaicMethod" : "esriMosaicNone", "ascending" : true, "fids":[' + entry.currentFID + '],"mosaicOperation" : "MT_FIRST"}'
													var ImageServiceStatRequest = esriRequest({
														url: entry.url + "/computeStatisticsHistograms",
														content: { geometryType: "esriGeometryEnvelope" , geometry: geom, mosaicRule: mr, f:"json"},
														handleAs: "json",
														callbackParamName: "callback"
													  });
													  ImageServiceStatRequest.then(
														lang.hitch(this,function(res) {
														  console.log("Success STAT: ", res, entry);
														  entry.currentSTATS = res;
														  
														  this.updateMap(entry);

													  }));
													  
													  
											  
											}));
			   
			   }
		   }));
		   
	   },
	   
	   updateMap(entry) {
		   
		   console.log('updating Map')
		   
		   if (entry == null) {
			   array.forEach(this.config.ImageServices, lang.hitch(this,function(tentry, i){
				   this.updateEntry(tentry);
				   
			   }));
		   } else {
			   this.updateEntry(entry);
		   }
	   },
	   
	   findCutoffs(values, min,max) {
		   
			range = max-min;
			mincut = ((parseFloat(values[0]) / 1000.000) * range) + min;
			maxcut = ((parseFloat(values[1]) / 1000.000) * range) + min;
			
			return [-9999,mincut,mincut,maxcut,maxcut,9999];
		   
	   },
	   
	   updateMap(entry) {
		   
		  console.log('updating: ', entry.label)
		   
		  entry.imageServiceLayer.setVisibility(entry.viz);

		  //var params = new ImageServiceParameters();
		  //params.noData = 0;
			
		  //fids = [entry.currentFID];
		  //var mr = new MosaicRule({"mosaicMethod" : "esriMosaicNone", "ascending" : true, "fids": fids,"mosaicOperation" : "MT_FIRST"});
		  //params.mosaicRule = mr;	
		  
		  //entry.imageServiceLayer.setMosaicRule(mr);
		   ocuts = this.findCutoffs(entry.sliderValues, entry.currentSTATS.statistics[0].min, entry.currentSTATS.statistics[0].max)
		  
			console.log(ocuts);
			 
			maxText = query('.' + entry.variableName + 'Values.maxValue')[0];
			maxText.value = ocuts[3].toFixed(2);
			
			minText = query('.' + entry.variableName + 'Values.minValue')[0];
			minText.value = ocuts[1].toFixed(2);
			
			rfout = new RasterFunction();
			rfout.functionName = "Remap";
			rfout.functionArguments = {
			  "InputRanges" : ocuts,
			  "OutputValues" : [1,100,250],
			  "Raster" : "$" + entry.currentFID
			};
			rfout.variableName = "riskOutput";
			rfout.outputPixelType = "U8";	


			colorRF = new RasterFunction();
			colorRF.functionName = "Colormap";
			colorRF.variableName = "riskOutput";
			colorRF.functionArguments = {
			  "Colormap" : [[1,0,100,0],[100,255,255,0],[250,255,0,0]],
			  "Raster" : rfout  //use the output of the remap rasterFunction for the Colormap rasterFunction
			};		
			
			entry.imageServiceLayer.setRenderingRule(colorRF);	
		 
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