/**
 * Created by edsan on 12/10/14.
 */

function Record(latitude, longitude, speciesInfo, id, date, time, notes, image, device_info, marker, infoWindow, row) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.speciesInfo = speciesInfo;
    this.id = id;
    this.date = date;
    this.time = time;
    this.notes = notes;
    this.image = image;
    this.deviceInfo = device_info;
    this.marker = marker;
    this.infoWindow = infoWindow;
    this.row = row;

}

function FlickrMarker(marker, date){
    this.marker = marker;
    this.date = date;
}

function generateContentString(date, speciesInfo, notes, device_info, image, table, id){
    var contentString = '<div id=contentString><p><strong>Date: </strong>'+ date+'</p>';
    if(speciesInfo != "") {
        contentString = contentString.concat('<p><strong>Species Info: </strong><span style="font-style: italic;">'+speciesInfo+'</span></p>');
    }
    if(notes != ""){
        contentString.concat('<p><strong>Notes: </strong>'+notes+'</p>');
    }
    if(device_info != ""){
        contentString.concat('<p><strong>Source: </strong>' + device_info + '</p>');
    }
     contentString = contentString.concat("<a href='information.php?table=" + table +"&id=" + id + "'>" +
    "<img src="+image+" width=\"150px\"></a></div>");
    if(table == "data_mining"){
    contentString = contentString.concat("<form action=\"flickrForm.php?table="+table+"&id="+id+"\" method='POST'>" +
    "Is this a real shark (no shark in aquaria)? <br><label for=\"radio_"+table+"_"+id+"_yes\">Yes</label>" +
    "<input type=\"radio\" name=\"radio_"+table+"_"+id+"\" value=\"yes\" id=\"radio_"+table+"_"+id+"_yes\">" +
    "<label for=\"radio_"+table+"_"+id+"_no\">No</label>" +
    "<input type=\"radio\" name=\"radio_"+table+"_"+id+"\" value=\"no\" id=\"radio_"+table+"_"+id+"_no\"><br>" +
    "What species?<input type=\"text\" name=\"species\">" +
    "<input type=\"submit\" value=\"Submit\"><br></form>");
    }
    
    return contentString;
}

function getFlickerRecords(){
    var pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7C99FF99');
    var allMarkers = [];
    var jqxhr = $.get( "getDataMiningPoints.php", function() {
    })
        .done(function(data) {
            var structure = JSON.parse(data);
            for(var obj in structure) {
                var latitude = structure[obj]['latitude'];
                var longitude = structure[obj]['longitude'];
                var imgURL = structure[obj]['img_url'];
                var date = structure[obj]['date'];
                var time = structure[obj]['time'];
                var id = structure[obj]['id'];

                var contentString = generateContentString(date, "","","",imgURL, "data_mining", id);

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(latitude, longitude),
                    map: null,
                    icon: pinImage
                });
                allMarkers.push(new FlickrMarker(marker, date));
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                google.maps.event.addListener(marker,'click', (function(marker,contentString,infowindow){
                    return function() {
                        infowindow.setContent(contentString);
                        infowindow.open(map,marker);
                    };
                })(marker,contentString,infowindow));
            }
        })
        .fail(function() {
            //alert( "error" );
        })
        .always(function() {
            //alert( "finished" );
        });
    jqxhr.always(function() {
        //alert( "second finished" );
        var checkbox = document.getElementById("flickrCheckBox").addEventListener("click",function(){toggleFlickr(allMarkers)});
        var range = document.getElementById("date_range").addEventListener('input', function(){updateMap(allMarkers, this.value);}, true);
        return allMarkers;
    });

}

function initialize() {
    var mapOptions = {
        zoom: 1,
        center: new google.maps.LatLng(0, 0)
    };
    var table = document.getElementsByClassName('TFtable')[0];
    var count = 1;
    var records = [];
    var flickrRecords = [];
    var sliding_bar = document.getElementById('sliding_bar');
    var range = document.getElementById("date_range");
    var range_output = document.getElementById("dates_output");
    var date_label = document.getElementById("date");
    date_label.style.visibility = "hidden";
    range_output.style.visibility = "hidden";
    range.style.visibility = "hidden";
    document.getElementById("dates_min").style.visibility = "hidden";
    document.getElementById("dates_max").style.visibility = "hidden";
    var output_div = document.getElementById("output_div");
    output_div.style.display = "flex";
    output_div.style.justifyContent = "center";

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
        document.getElementById('legend'));
    map.controls[google.maps.ControlPosition.BOTTOM].push(sliding_bar);

        var jqxhr = $.get( "getLocationData.php", function() {
        })
            .done(function(data) {
                var structure = JSON.parse(data);
                for(var obj in structure) {
                    var latitude = structure[obj]['latitude'];
                    var longitude = structure[obj]['longitude'];
                    var speciesInfo = structure[obj]['species_name'];
                    var id = structure[obj]['id'];
                    var date = structure[obj]['date'];
                    var time = structure[obj]['time'];
                    var notes = structure[obj]['notes'];
                    var image = structure[obj]['image'];
                    var device_info = structure[obj]['device_type'];

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(latitude, longitude),
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: speciesInfo
                    });

                    var contentString = generateContentString(date, speciesInfo, notes, device_info,image, "sharkpulse", id);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    var row = table.insertRow(count);
                    row.id = ""+count;

                    google.maps.event.addListener(marker,'click', (function(marker,contentString,infowindow){
                        return function() {
                            infowindow.setContent(contentString);
                            infowindow.open(map,marker);
                        };
                    })(marker,contentString,infowindow));



                    var idCol = row.insertCell(0);
                    var dateCol = row.insertCell(1);
                    var timeCol = row.insertCell(2);
                    var speciesCol = row.insertCell(3);
                    var longitudeCol = row.insertCell(4);
                    var latitudeCol = row.insertCell(5);
                    var notesCol = row.insertCell(6);
                    var sourceCol = row.insertCell(7);
                    var imageCol = row.insertCell(8);

                    idCol.innerHTML = id;
                    dateCol.innerHTML = date;
                    timeCol.innerHTML = time;
                    speciesCol.innerHTML = "<span id='species_info' style='font-style: italic;'>" + speciesInfo + "</span>";
                    longitudeCol.innerHTML = longitude;
                    latitudeCol.innerHTML = latitude;
                    notesCol.innerHTML = notes;
                    sourceCol.innerHTML = device_info;
                    imageCol.innerHTML = "<img src='"+image+"' width='100px'>";
                    count++;

                    var record = new Record(latitude,longitude,speciesInfo,id,date,time,notes,image,device_info,marker,infowindow,row);
                    record.row.addEventListener("mouseenter",function(e){animateMarker(records,e);});
                    record.row.addEventListener("mouseleave",function(e){stopMarker(records,e);});
                    records.push(record);
                }
            })
            .fail(function() {
                //alert( "error" );
            })
            .always(function() {
                //alert( "finished" );
                flickrRecords = getFlickerRecords();

            });
        jqxhr.always(function() {
            var legend = document.getElementById('legend');
            var div = document.createElement('div');
            div.innerHTML = '<img src="../img/Farm-Fresh_flickr.png" style="float: right;"><input type="checkbox" name="flickrCheckBox" id="flickrCheckBox">';
            legend.appendChild(div);
        });

}
function updateMap(flickr, value){
    var previousValue = document.getElementById("dates_output").value;
    var dateLabel = document.getElementById("date");

    var range = document.getElementById("date_range");
    var output = document.getElementById("dates_output");

    output.value = range.value;

    var difference = output.value - previousValue;

    if(difference < 0){
        var beginningIndex = Math.floor(flickr.length * (previousValue / 100));
        var endingIndex = beginningIndex + Math.floor(flickr.length * (difference / 100));
        if(endingIndex != -1){
            for(var i = endingIndex; i < beginningIndex; i++){
                flickr[i].marker.setMap(null);

            }
            dateLabel.value = flickr[endingIndex].date;
        }else{
            flickr[0].marker.setMap(null);
        }

    }
    else{
        //console.log("Went up");
        var beginningIndex = Math.floor(flickr.length * (previousValue / 100));
        var endingIndex = beginningIndex + Math.floor(flickr.length * (difference / 100));
        for(var i = beginningIndex; i < endingIndex; i++){
            flickr[i].marker.setMap(map);
            dateLabel.value = flickr[i].date;
        }
    }


}

function animateMarker(records, e){
    records[e.target.id-1].marker.setAnimation(google.maps.Animation.BOUNCE);
}
function stopMarker(records, e){
    records[e.target.id-1].marker.setAnimation(null);
}

function toggleFlickr(flickrRecords){
    var x = document.getElementById("flickrCheckBox");
    var dateMinLabel = document.getElementById("dates_min");
    var dateMaxLabel = document.getElementById("dates_max");
    var dateLabel = document.getElementById("date");

    var length_percentage = document.getElementById("dates_output").value / 100;
    var length = Math.floor(flickrRecords.length * length_percentage);

    if(x.checked){
        for(var i = 0; i < length; i++){
            flickrRecords[i].marker.setMap(map);

        }
        document.getElementById('date_range').style.visibility = "visible";
        document.getElementById("dates_output").style.visibility = "hidden";
        dateMaxLabel.innerHTML = flickrRecords[flickrRecords.length - 1].date;
        dateMinLabel.innerHTML = flickrRecords[0].date;
        dateMinLabel.style.visibility = "visible";
        dateMaxLabel.style.visibility = "visible";
        dateLabel.style.visibility = "visible";

    }
    else{
        for(var i = 0; i < flickrRecords.length; i++){
            flickrRecords[i].marker.setMap(null);
        }
        document.getElementById('date_range').style.visibility = "hidden";
        document.getElementById("dates_output").style.visibility = "hidden";
        dateMinLabel.style.visibility = "hidden";
        dateMaxLabel.style.visibility = "hidden";
        dateLabel.style.visibility = "hidden";
    }
}

function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' +
    'callback=initialize';
    document.body.appendChild(script);
}


