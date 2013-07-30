var Follower, FollowerLogger,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FollowerLogger = (function() {
  function FollowerLogger() {}

  FollowerLogger.log = function(message) {
    var entry;
    var currentdate = new Date(); 
    var time =  currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds(); + " > "
    var moment = $('<span>').text(time);
    var msg = $('<span>').text(message);
    entry = $('<p class="console-entry">').append(moment).append(msg);
    return $('.console-holder').prepend(entry);
  };

  return FollowerLogger;

})();

Follower = (function() {
  var status;

  function Follower() {
    //this.stopTracking = __bind(this.stopTracking, this);
    this.startTracking = __bind(this.startTracking, this);
  }

  status = 'IDLE';

  Follower.prototype.log = function(message) {
    var entry;
    var currentdate = new Date(); 
    var time =  currentdate.getHours() + ":"  
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
    
    this.log('binding')
    _this = this;
    $('.action-button.halt').on('click',_this.stopTracking);
    $('.action-button.track').on('click',_this.startTracking);
    $('.action-button.current').on('click',_this.currentPosition);
    
    if (! window.localStorage.getItem('deviceName'))
    {
      this.log('registering...');
      var options = {
        url : 'http://www.routing.uc.cl/reg_gps',
        type:'GET',
        data: {
            sender:'follower',
        }
      }
      $.ajax(options).done(function(data){
        window.data = data;
        window.localStorage.setItem("deviceName",data);
        FollowerLogger.log(data);
      }); 
    }else
    {
      this.log('Machine is ' + window.localStorage.getItem('deviceName'))
    }
    if(!!window.localStorage.getItem("positions"))
    {
      window.positions = $.parseJSON(window.localStorage.getItem("positions"));
    }else
    {
      window.positions = [];
    }
    setInterval(function(){
      window.localStorage.setItem("positions",JSON.stringify(window.positions));  
    },60000);

    setInterval(function(){
      var p = window.positions;
      var ok = true;
      if(!!p && p.length > 0 && ok)
      {
        var options = {
          url : 'http://www.routing.uc.cl/log_gps',
          type:'POST',
          data: p[0]
        }
        $.ajax(options).done(function(data){
          
          for(i = 0; i < p.length; i++)
          {
            if (!!p[i] && p[i].timestamp == data.timestamp)
            {
              p.splice(i,1);

            }
          }
        }).error(function(){
          console.warn("Failed sending");
          
        });   
      }
      
    },6000);
    return true;
  };

  Follower.prototype.startTracking = function() {
    window.localStorage.setItem("status","tracking");
    _this = this;

    if (!window.localStorage.getItem('segment'))
    {
      window.localStorage.setItem('segment',0);
    }
    else
    {
      window.localStorage.setItem('segment',parseInt(window.localStorage.getItem('segment'))+1);
    }

    this.watchId = navigator.geolocation.watchPosition(function(){console.log("Success")},function(){console.log("Error",arguments)},{frequency: 19000, enableHighAccuracy:true});
    _this.currentPosition();
    
    this.intervalId = setInterval(_this.currentPosition,10000);
    window.watchId = this.watchId;
    window.intervalId = this.intervalId;
    return this.log("Track started");
  };

  Follower.prototype.stopTracking = function() {
    window.localStorage.setItem("status","stopped");
    navigator.geolocation.clearWatch(window.watchId);
    clearInterval(window.intervalId);
    return FollowerLogger.log("Track stopped");
  };

  Follower.prototype.currentPosition = function() {
    console.log("currentPosition");
    //if (window.localStorage.getItem("status") != "tracking" ) return ;
    _this = this;
    
    navigator.geolocation.getCurrentPosition(function(position){
      window.lastPosition = position;
      var positionString = position.coords.latitude + " , " + position.coords.longitude 
      var timestamp = position.timestamp
      var accuracy = position.coords.accuracy;
      var dataToSend = {
              sender:window.localStorage.getItem('deviceName'),
              segment:window.localStorage.getItem('segment'),
              position: positionString ,
              accuracy: accuracy,
              timestamp: timestamp
          }
      if(!window.positions){ 
        window.positions = [];
      }    
      window.positions.push(dataToSend);
      
      var options = {
          url : 'http://www.routing.uc.cl/log_gps',
          type:'POST',
          data: dataToSend
      }
      FollowerLogger.log(positionString);
      $.ajax(options).done(function(data){
        console.log("Done. Data: ", data.timestamp);
        var p = window.positions;
        for(i = 0; i < p.length; i++)
        {
          if (!!p[i] && p[i].timestamp == data.timestamp)
          {
            console.log("Removing ",i,p[i]);
            p.splice(i,1);

          }
        }
      }); 

    });

    return null;
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