var Follower, FollowerLogger,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FollowerLogger = (function() {
  function FollowerLogger() {}

  FollowerLogger.log = function(message) {
    var entry;
    console.log("Follower logger", message);
    entry = $('<p class="console-entry">').text(message);
    return $('.console-holder').prepend(entry);
  };

  return FollowerLogger;

})();

Follower = (function() {
  var status;

  function Follower() {
    this.stopTracking = __bind(this.stopTracking, this);
    this.startTracking = __bind(this.startTracking, this);
  }

  status = 'IDLE';

  Follower.prototype.log = function(message) {
    var entry;
    var currentdate = new Date(); 
	var time = 	currentdate.getHours() + ":"  
                	+ currentdate.getMinutes() + ":" 
                	+ currentdate.getSeconds(); + " > "
    var moment = $('<span>').text(time);
    var msg = $('<span>').text(message);
    entry = $('<p class="console-entry">').append(moment).append(msg);
    return $('.console-holder').prepend(entry);
  };

  Follower.prototype.contructor = function() {

  };

  Follower.prototype.bind = function() {
  	console.log ('binding')
  	this.log('binding')
    $('.action-button.track').on('click',this.startTracking);
    $('.action-button.current').on('click',this.currentPosition);
    return $('.action-button.stop').click(this.stopTracking);
  };

  Follower.prototype.startTracking = function() {
    this.status = 'TRACKING';
    _this = this;

    this.watchId = navigator.geolocation.watchPosition(
    	function(){
    		window.lastPosition = position;
	    	var positionString = position.coords.latitude + " , " + position.coords.longitude 
	        var timestamp = "timestamp: " + position.timestamp
	        var accuracy = position.coords.accuracy;
	        var _data = "" + timestamp + "> " + positionString + " " + accuracy ;
	        FollowerLogger.log(_data);

	        var options = {
	        	url : 'http://www.routing.uc.cl/log_gps',
				type:'POST',
	            data: {
	            	sender:'follower',
	        		position: positionString + "("+accuracy+")",
	        		extra_data:timestamp
	            }
	        }

	        $.ajax(options).done(function(data){FollowerLogger.log("Data sent: "); FollowerLogger.log(data);});	
    	},
    	function(){},
    	{timeout: 10000 , enableHighAccuracy: true}
    );
    return this.log("Track started");
  };


  Follower.prototype.currentPosition = function() {
    this.status = 'TRACKING';
    _this = this;
    
    navigator.geolocation.getCurrentPosition(function(position){
    	window.lastPosition = position;
    	var positionString = position.coords.latitude + " , " + position.coords.longitude 
        var timestamp = "timestamp: " + position.timestamp
        var accuracy = position.coords.accuracy;
        var _data = "" + timestamp + "> " + positionString + " " + accuracy ;
        FollowerLogger.log(_data);

        var options = {
        	url : 'http://www.routing.uc.cl/log_gps',
			type:'POST',
            data: {
            	sender:'follower',
        		position: positionString + "("+accuracy+")",
        		extra_data:timestamp
            }
        }

        $.ajax(options).done(function(data){FollowerLogger.log("Data sent: "); FollowerLogger.log(data);});	

    	});

    return null;
  };

  Follower.prototype.stopTracking = function() {
    this.status = 'IDLE';
    navigator.geolocation.clearWatch(this.watchId);
    return FollowerLogger.log("Track stopped");
  };

  return Follower;

})();

if (window.Follower == null) {
  window.Follower = Follower;
}

/*
console.log("startTracking")
watch_id = navigator.geolocation.watchPosition(

	// Success
    function(position){

        //tracking_data.push(position);
        window.lastPosition = position;
        console.log ("New position");
        positionString = "<"
        for(key in position.coords)
        {
        	positionString += key + ":" +position.coords[key]+", ";
        }
        positionString += ">"
        timestamp = "timestamp: " + position.timestamp
        FollowerLogger.log("New position " + positionString + " " + timestamp) ;

        
    },
    
    // Error
    function(error){
        console.log(error);
    },
    
    // Settings
    { frequency: 30, enableHighAccuracy: true }
);*/