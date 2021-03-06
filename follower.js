var Follower, FollowerLogger,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FollowerLogger = (function() {
  function FollowerLogger() {}

  FollowerLogger.log = function(message) {
    var entry;
    var currentdate = new Date();
    var time = currentdate.toLocaleTimeString();
    /*
    var time =  currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds(); + " > "
    */
    var moment = $('<span>').text(time);
    var msg = $('<span>').text(message);
    entry = $('<p class="console-entry">').append(moment).append(msg);
    return $('.console-holder').prepend(entry);
  };

  return FollowerLogger;

})();

Follower = (function() {
  function Follower() {
    //this.stopTracking = __bind(this.stopTracking, this);
    this.startTracking = __bind(this.startTracking, this);
  }

  Follower.prototype.log = function(message) {
    var entry;
    var currentdate = new Date();
    var time = currentdate.toLocaleTimeString();
    /* var time =  currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds(); + " > " */
    var moment = $('<span>').text(time);
    var msg = $('<span>').text(message);
    entry = $('<p class="console-entry">').append(moment).append(msg);
    return $('.console-holder').prepend(entry);
  };

  Follower.prototype.contructor = function() {

  };

  Follower.prototype.pair = function(evt) {
    var token = $('#pairToken').val();
    var nickname = $('#pairNickname').val();
    var new_device_request = {
      token: token,
      device_id: window.localStorage.getItem('deviceName'),
      nickname: nickname
    };
    var options = {
      url: 'http://admin.rem.routing.uc.cl/api/new_device/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(new_device_request)
    };
    FollowerLogger.log("Pairing...");
    $.ajax(options).done(function(data){
        window.localStorage.setItem('deviceIsPaired', 'true');
        FollowerLogger.log("Paired successfully");
        $('#pairForm').hide();
      }).fail(function(data){
        window.localStorage.setItem('deviceIsPaired', 'false');
        FollowerLogger.log("Error pairing");
      });
    evt.stopPropagation();
    return false;
  }

  Follower.prototype.bind = function() {
    this.log('Binding...');
    _this = this;
    $('.action-button.halt').on('click',_this.stopTracking);
    $('.action-button.track').on('click',_this.startTracking);
    $('.action-button.current').on('click',_this.currentPosition);
    $('#pairSubmit').on('click',_this.pair);

    // Set initial status
    window.localStorage.setItem('status', 'stopped');

    // Use device UUID as sender ID if available
    /* if (window.device.uuid) {
      console.log('Device UUID is', window.device.uuid);
      window.localStorage.setItem("deviceName", window.device.uuid);
    }; */

    if (! window.localStorage.getItem('deviceName')) {
      console.log('No sender ID found, requesting one...');
      this.log('Registering...');
      var options = {
        url : 'http://www.routing.uc.cl/reg_gps',
        type:'GET',
        data: {
            sender:'follower',
        }
      };
      $.ajax(options).done(function(data){
        window.data = data;
        window.localStorage.setItem("deviceName", data);
        this.log('Got sender ID: ' + window.localStorage.getItem('deviceName'));
      });
    } else {
      this.log('Sender ID: ' + window.localStorage.getItem('deviceName'));
    };

    if (window.localStorage.getItem('deviceIsPaired') == 'true') {
      console.log('Device already paired');
      $('#pair').hide();
    } else {
      this.log('Device not paired yet');
    };

    if(!!window.localStorage.getItem("positions"))
    {
      window.positions = $.parseJSON(window.localStorage.getItem("positions"));
    } else
    {
      window.positions = [];
    };

    setInterval(function(){
      window.localStorage.setItem("positions",JSON.stringify(window.positions));  
    }, 60*1000);

    setInterval(function(){
      var p = window.positions;
      var ok = true;
      if(!!p && p.length > 0 && ok)
      {
        var position_to_send = p.shift();
        position_to_send.time_sent = new Date().toISOString()
        var options = {
          url : 'http://api.routing.uc.cl/trackpoints/?bind',
          type:'POST',
          /* data: JSON.stringify(p[0]), */
          data: JSON.stringify(position_to_send),
          contentType: 'application/json',
          context: position_to_send
        };
        $.ajax(options).done(
          function() {
            console.log("(bind) Successfully sent:", this.position, 'Queue length:', p.length);
            /* for(i = 0; i < p.length; i++)
            {
              if (!!p[i] && p[i].timestamp == data.timestamp)
              {
                p.splice(i,1);

              };
            }; */
          }
        ).fail(
          function() {
            p.unshift(this);
            console.warn("(bind) Failed sending. Queue length: ", p.length);
        });
      }
      
    }, 6*1000);

    /*
    setTimeout(
      function() {
        if (window.localStorage.getItem('status') == 'tracking') {
          console.log('Track ' + window.localStorage.getItem('segment') + ' already in progress while binding. Restarting it...');
          _this.startTracking(true);
        };
      },
      5*1000
    );
    */
    if (window.localStorage.getItem('status') == 'tracking') {
      console.log('Track ' + window.localStorage.getItem('segment') + ' already in progress while binding. Killing it...');
      window.localStorage.setItem('deadSegment', window.localStorage.getItem('segment'));
      window.localStorage.setItem('status', 'stopped');
      window.localStorage.removeItem('segment');
    };

    console.log('Finished binding');
    return true;
  };

  Follower.prototype.startTracking = function() {
    console.log('StartTracking...');

    _this = this;

    if (window.localStorage.getItem('status') == 'tracking') {
      return FollowerLogger.log('Track already in progress: ' + window.localStorage.getItem('segment'));
    };

    window.localStorage.setItem("status","tracking");

    if (!window.localStorage.getItem('segment'))
    {
      // window.localStorage.setItem('segment',0);
      window.localStorage.setItem('segment', new Date().getTime());
    }
    else
    {
      // window.localStorage.setItem('segment',parseInt(window.localStorage.getItem('segment'))+1);
    };

    this.watchId = navigator.geolocation.watchPosition(
      function() {console.log("Success (watchPosition)")},
      function() {console.log("Error (watchPosition)",arguments)},
      {frequency: 19000, enableHighAccuracy:true}
    );
    _this.currentPosition();
    
    this.intervalId = setInterval(_this.currentPosition, 10*1000);
    window.watchId = this.watchId;
    window.intervalId = this.intervalId;
    return this.log('Track started: ' + window.localStorage.getItem('segment'));
  };


  Follower.prototype.stopTracking = function() {
    console.log('stopTracking...');

    if (window.localStorage.getItem('status') != 'tracking') {
      return FollowerLogger.log('No track in progress');
    };

    var current_segment = window.localStorage.getItem('segment');
    var current_status = window.localStorage.getItem('status');
    console.log('Stopping tracking. Status was:', current_status);

    window.localStorage.setItem("status","stopped");
    navigator.geolocation.clearWatch(window.watchId);
    clearInterval(window.intervalId);
    window.localStorage.removeItem('segment');
    return FollowerLogger.log('Track stopped: ' + current_segment);
  };


  Follower.prototype.currentPosition = function() {
    //console.log("currentPosition");
    //if (window.localStorage.getItem("status") != "tracking" ) return ;
    _this = this;
    
    navigator.geolocation.getCurrentPosition(function(position){
      window.lastPosition = position;
      var positionString = position.coords.latitude + ' ' + position.coords.longitude 
      // var timestamp = new Date(position.timestamp);
      // var accuracy = position.coords.accuracy;
      var dataToSend = {
              version: 'follower:v1.1',
              sender:window.localStorage.getItem('deviceName'),
              segment:window.localStorage.getItem('segment'),
              time_sent: 'TIME_SENT__NOT_SET_YET',
              position: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                time_captured: new Date(position.timestamp).toISOString(),
                accuracy: position.coords.accuracy,
                speed: position.coords.speed
              }
          }
      // console.log(dataToSend);
      if(!window.positions){ 
        window.positions = [];
      }
      /*
      window.positions.push(dataToSend);

      var options = {
          // url : 'http://www.routing.uc.cl/log_gps',
          url: 'http://api.routing.uc.cl/trackpoints/?currentpos',
          type:'POST',
          data: JSON.stringify(dataToSend)
      }
      */
      position_to_send = dataToSend;

      position_to_send.time_sent = new Date().toISOString()

      var options = {
        url : 'http://api.routing.uc.cl/trackpoints/?currentpos',
        type:'POST',
        /* data: JSON.stringify(p[0]), */
        data: JSON.stringify(position_to_send),
        contentType: 'application/json',
        context: position_to_send
      };

      FollowerLogger.log(positionString);
      var p = window.positions;

      $.ajax(options).done(
        function(data) {
          // console.log("Done (currentpos). Data: ", data.timestamp);
          console.log("(currentPos) Successfully sent:", this.position, 'Queue length:', p.length);
          /* var p = window.positions;
          for(i = 0; i < p.length; i++)
          {
            if (!!p[i] && p[i].timestamp == data.timestamp)
            {
              console.log("Removing ",i,p[i]);
              p.splice(i,1);

            };
          };
          */
        }
      ).fail(
        function() {
          p.push(this);
          console.warn("(currentPos) Failed sending. Queue length:", p.length);
        }
      );

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