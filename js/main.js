"use strict";

var uk_post_districts;
//show layer with loading animation
jQuery.getJSON("data/uk_post_districs.json",function(data) {
	//hide layer with loading animation
	uk_post_districts=data;
	dataReady();
});

//global vars
var current_rivalry = 0; // this is what we will change with our drop down select box
var team1,team2;
var colorMin,colorMax,geojson,map,info;

$(document).ready(function() {

		//Build list of rivalries
		 var list = $("#rivalryList");
		 for (var i=0; i<rivalries.length; i++) {
		 	var r=rivalries[i];
		 	var li = $("<li/>");
		 	 $("<a/>",{
		 		"href":"#riv"+i,
		 		"title":r.rivalry_info,
		 		"text": r.name,
		 		"class": "dataLink"/*,
		 		"data-index":i*/
		 		}).appendTo(li);
		 	li.appendTo(list);
		 	//$("<li/>").text(r.rivalry_info).appendTo(list);
		 }		 
		 
		 //Build list of teams
		 var list = $("#teamList");
		 for (var t in teamsData) {
		 	if (t=="random") continue;
		 	var li = $("<li/>");
		 	 $("<a/>",{
		 		"href":"#"+t,
		 		"title":teamsData[t].name,
		 		"text": teamsData[t].name,
		 		"class": "dataLink"/*,
		 		"data-index":i*/
		 		}).appendTo(li);
		 	li.appendTo(list);
		 	//$("<li/>").text(r.rivalry_info).appendTo(list);
		 }	

		 $("a.dataLink").click(function() {
			//console.log(event.srcElement.hash);
		 	$("#controlwrapper").animate({marginBottom: "-440px"}, 400);//Hide bottom panel
		 	showData($(this).attr("href"));
		 });		 
		 
		 
		//Build map
		var bounds = [[58.79,-8.3],[48.8,2.48]];
		//var mbounds = [[70,-9],[30,5]];
		map = L.map('map').fitBounds(bounds);///.setView([54.6342, -5.2], 6);
		L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
			key: 'BC9A493B41014CAABB98F0471D759707'
			}).addTo(map);
		 
		/*geojson = L.geoJson(uk_post_districts, {
				//style: style,
				onEachFeature: onEachFeature
			}).addTo(map);*/
			
			//Hover
			info = L.control();
			info.onAdd = function (map) {
				this._div = L.DomUtil.create('div', 'info');
				this.update();
				return this._div;
			};
			info.update = function (props) {
				if (props) {
					var postcode=props.post_4;
					var str = '<h4>Twitter Fandom</h4> Postcode region: ' + postcode;
					for (var team in teamsData) {
						if (team=="random") continue;
						str+="<br/>";
						if (team==team1 || team==team2)	str+="<strong>"
						str+=teamsData[team]["name"] + ": " + twitterData[postcode][team];
						if (team==team1 || team==team2)	str+="</strong>"
					}	
						//teamsData[team1]["name"]+': '+ twitterData[postcode][team1] + '<br>'+
						//teamsData[team2]["name"]+': '+ twitterData[postcode][team2];
					this._div.innerHTML=str;
				} else {
					this._div.innerHTML = '<h4>Twitter Fandom</h4>Hover over a postcode region';
				}
			};
			info.addTo(map);			
			
		
		var hash=document.location.hash;
		if (hash=="" || hash=="#") {
			hash="#riv0";
		}
		prepareGUI(hash);
		
		$('#controlButton').click(function () {
			 $("#controlwrapper").animate({marginBottom: 0}, 400);
		});
});




		function prepareGUI(what) {
			if (what.indexOf("#riv")!=-1) {
				current_rivalry = what.substr(4);
				//current_rivalry = 0; // this is what we will change with our drop down select box
				team1 = rivalries[current_rivalry]['teams'][0]['variable'];
				team2 = rivalries[current_rivalry]['teams'][1]['variable'];
				
				$('#team2logo').show();
				$('#team2name').show();
				$("#vs").show();

			} else {
				team1 = teamsData[what.substr(1)]['variable'];
				team2 = "random";
				
				//set random color to lighter shade of team1 color
				teamsData[team2]['color']=getLightShade(teamsData[team1]['color']);
				
				$('#team2logo').hide();
				$('#team2name').hide();
				$("#vs").hide();
			}
			
			// this will be refactored into some sort of changeRivalry() function
			$('#team1logo').attr("src", teamsData[team1]['crest']);
			$('#team1name').text(teamsData[team1]['name']);
		
			$('#team2logo').attr("src", teamsData[team2]['crest']);		
			$('#team2name').text(teamsData[team2]['name']);
		}
		 
			
		function showData(what) {
			prepareGUI(what);
			dataReady();
		}
		
		function dataReady() {
		
			//var colorMin=1,colorMax=0;
			var colorDist=[];
			for (var i=0; i<uk_post_districts.features.length; i++){
				var postcode = uk_post_districts.features[i].properties["post_4"];
				var t1 = twitterData[postcode][team1];
				var t2 = twitterData[postcode][team2];
				if (t1==0||t2==0) continue;
				var n = t1/(t1+t2);
				/*if (n<colorMin) {
					colorMin=n;
				} else if (n>colorMax) {
					colorMax=n;
				}*/
				colorDist.push(n);
			}
			//console.log(colorMin);
			//console.log(colorMax);
			colorDist.sort();
			colorMin=colorDist[0];
			colorMax=colorDist[colorDist.length-1];
			//console.log(colorMin);
			//console.log(colorMax);
		
		
		
			if (geojson) {
				geojson.setStyle(style);
			} else {//first time
				geojson = L.geoJson(uk_post_districts, {
					style: style,
					onEachFeature: onEachFeature
				}).addTo(map);
			}
		}//End show data

			function highlightFeature(e) {
				var layer = e.target;

				layer.setStyle({
					weight: 2,
					color: '#ffffff',
					fillOpacity: 0.6
				});

				if (!L.Browser.ie && !L.Browser.opera) {
					layer.bringToFront();
				}

				info.update(layer.feature.properties);
			}
		
			function resetHighlight(e) {
				geojson.resetStyle(e.target);
				info.update();
			}

			function zoomToFeature(e) {
				map.fitBounds(e.target.getBounds());
			}

			function onEachFeature(feature, layer) {
				layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					//click: zoomToFeature //Removing for now https://github.com/oxfordinternetinstitute/football-mapping/issues/5
				});
			}			

			function style(feature) {
				
				var value1,value2; //temp variables for storing statistics
				
				var postcode=feature.properties.post_4;
				value1=twitterData[postcode][team1];
				value2=twitterData[postcode][team2];
														
				//polygoncolor = value1 > value2 ? rivalries[current_rivalry]['teams'][0]['color'] : rivalries[current_rivalry]['teams'][1]['color'];
				//polygoncolor = blend(rivalries[current_rivalry]['teams'][0]['color'],value1,
				//	rivalries[current_rivalry]['teams'][1]['color'],value2);
				
				var polygoncolor;
				if (value1==0 && (team2=="random"||value2==0)) {
					polygoncolor="none";
				} else {
					var col = value1/(value1+value2);
					col = (col-colorMin)*(1/(colorMax-colorMin));
					polygoncolor = normBlend(teamsData[team1]['color'],teamsData[team2]['color'],col);
				}

				return {
					weight: 0.5,
					opacity: 1,
					color: 'none',
					fillOpacity: 0.8,
					fillColor: polygoncolor,

				};
			}

			function onEachFeature(feature, layer) {
						layer.on({
							mouseover: highlightFeature,
							mouseout: resetHighlight,
							//click: zoomToFeature //See Issue 5
						});
					}
