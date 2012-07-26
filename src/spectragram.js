/* Copyright (c) 2012 Adrian Quevedo; Licensed MIT, GPL */

// Utility for older browsers
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function ($, window, document, undefined) {
	
	var Instagram = {

        //Initialize function
        init: function (options, elem) {
            var self = this;

            self.elem = elem;
            self.$elem = $(elem);

            self.api = 'https://api.instagram.com/v1';
			
			self.accessData = $.fn.spectragram.accessData;
						
			self.options = $.extend({}, $.fn.spectragram.options, options);
        },

        //Users		
		//Get the most recent media published by a user.
        getRecentMedia: function ( userID ) {
			var self = this,
				getData = '/users/' + userID + '/media/recent/?' + self.accessData.clientID + '&access_token='+ self.accessData.accessToken +'';
				
                self.fetch(getData).done(function ( results ) {
                    self.display(results);
                });
		},
		
		//Search for a user by name.
        getUserFeed: function () {
			var self = this,
				getData = '/users/search?q=' + self.options.query + '&count=' + self.options.max + '&client_id=' + self.accessData.clientID + '';

				self.fetch(getData).done(function ( results ) {
					if(results.data.length){
						self.getRecentMedia(results.data[0].id);
					}else{
						$.error('Spectagram.js - Error: the username ' + self.options.query + ' does not exist.');
					}
                });        
		},

        //Media
        //Get a list of what media is most popular at the moment
        getPopular: function () {
            var self = this,
                getData = '/media/popular?client_id=' + self.accessData.clientID + '&access_token='+ self.accessData.accessToken + '';
                
                self.fetch(getData).done(function ( results ) {
                    self.display(results);
                });
        },

        //Tags
        //Get a list of recently tagged media
        getRecentTagged: function () {
            var self = this,
                getData = '/tags/' + self.options.query + '/media/recent?client_id=' + self.accessData.clientID + '&access_token='+ self.accessData.accessToken + '';
                
                self.fetch(getData).done(function ( results ) {                    
					if(results.data.length){
						self.display(results);
					}else{
						$.error('Spectagram.js - Error: the tag ' + self.options.query + ' does not have results.');
					}
                });
        },

        fetch: function (getData) {
            var self = this,
                getUrl = self.api + getData;

            return $.ajax({
                type: "GET",
                dataType: "jsonp",
                cache: false,
                url: getUrl
            });
        },

        display: function (results) {
            var self = this,
                setSize = self.options.size,
                size, max = (self.options.max >= results.data.length) ? results.data.length : self.options.max;

            if (results.data.length === 0) {
                self.$elem.append($(self.options.wrapEachWith).append(self.options.notFoundMsg));
            }
            else {
				for (var i = 0; i < max; i++) {
					if (setSize === "small") {
						size = results.data[i].images.thumbnail.url;
					}
					else if (setSize === "medium") {
						size = results.data[i].images.low_resolution.url;
					}
					else {
						size = results.data[i].images.standard_resolution.url;
					}
					self.$elem.append($(self.options.wrapEachWith).append("<a target='_blank' href='" + results.data[i].link + "'><img src='" + size + "'></img></a>"));
				}
            }
        }
    };
	
	jQuery.fn.spectragram = function ( method, options ) {
		
		if(jQuery.fn.spectragram.accessData.clientID){
		
			return this.each( function () {
				var instagram = Object.create( Instagram );
				instagram.init( options, this );		
				if( instagram[method] ) { 
					instagram[method]( this );
				}else{ 
					$.error( 'Method ' + method + ' does not exist on jQuery.spectragram' );
				}
			});
		
		}else{
			$.error( 'You must define an accessToken and a clientID on jQuery.spectragram' );
		}
    };

    //Plugin Default Options
    jQuery.fn.spectragram.options = {
		max: 10,
		query: 'coffee',
		size: 'medium',
        wrapEachWith: '<li></li>'        
    };
	
	//Instagram Access Data
	jQuery.fn.spectragram.accessData = {
        accessToken: null,
		clientID: null        
    };

}(jQuery, window, document));