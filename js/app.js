var park = {lat: 36.1490, lng: -86.8120};
var opry = {lat: 36.2069, lng: -86.6921};
var vandy = {lat: 36.1447, lng: -86.8027};
var bird = {lat: 36.1021, lng: -86.8168};      
var belle = {lat: 36.1048, lng: -86.8657};

var ViewModel = function () {
    var self = this;
    var infowindow;        
    self.locations = ko.observableArray([
           {id: 'park', name: 'The Parthenon', latlong:  park, wiki: 'Parthenon_(Nashville)'},             {id: 'opry', name: 'Grand Ole Opry', latlong:  opry, wiki: 'Grand_Ole_Opry'},
           {id: 'vandy', name: 'Vanderbilt University', latlong: vandy, wiki: 'Vanderbilt_University'},
           {id: 'bird', name: 'The Bluebird Cafe', latlong: bird, wiki: 'Bluebird_Café'},
           {id: 'belle', name: 'Belle Meade Plantation', latlong: belle, wiki: 'Belle_Meade_Plantation'}
           ]);
             
    self.query = ko.observable('');

    self.modalArticle = ko.observableArray();
           
             //click event for list items
    self.listViewClick = function(location) {
        google.maps.event.trigger(location.marker,'click');
     };
             
             //search event to filter list
    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.locations(), function(listResult) {
           var match = listResult.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
           if (listResult.marker) {
               listResult.marker.setVisible(match);
           }
           return match;
        });
                 
    });
             
};
         
//initialize map, markers, and infowindows. markers and infowindows are tied to observed array
ViewModel.prototype.initMap = function() {
    var self = this;
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 36.13, lng: -86.767960},
        zoom: 12,
        streetViewControl: false
     });
             
    infowindow = new google.maps.InfoWindow();
             
    this.locations().forEach(function(v,i){
        var marker = new google.maps.Marker({
            position: v.latlong,
            map: self.map,
            title: v.name
        });
        self.locations()[i].marker = marker;
                 
        self.locations()[i].marker.addListener('click', function() {
             var contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h3>' + self.locations()[i].name + '</h3>'+
                '<div id="bodyContent">'+
                '</div></div>';

                infowindow.setContent(contentString);
                     
                infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ marker.setAnimation(null); }, 1400);
                     

                     $.ajax({
                         type: "GET",
                         url: "http://en.wikiedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + self.locations()[i].wiki + "&callback=?",
                         contentType: "application/json; charset=utf-8",                             
                         async: true,
                         dataType: "json",
                         success: function (data, textStatus, jqXHR) {

                            var markup = data.parse["text"]["*"];
                            var blurb = $('<div></div>').html(markup);

                            // remove links as they will not work
                            blurb.find('a').each(function() { $(this).replaceWith($(this).html()); });

                            //blurb.find('p').first().remove();
                            // remove any references
                            blurb.find('sup').remove();

                            blurb.find('Template:Infobox N').remove();

                            // remove cite error
                            blurb.find('.mw-ext-cite-error').remove();
                            var article = blurb.find('p');
                            self.modalArticle.removeAll();
                            for (var i = 0; i < article.length; i++) {
                                if (article[i].innerText != 'Template:Infobox N') {
                                    self.modalArticle.push(article[i].innerText);
                                }
                            }
                            
             

                       },
                       error: function (errorMessage) {
                           window.alert("We're sorry, the info from Wikipedia could not be loaded at this time");
                       }
                    });
              
         });
         
    });
};
          
googleError = function() {
    window.alert("Google Maps API could not be loaded at this time");
    
};
             
         
var vm = new ViewModel();
ko.applyBindings(vm);        