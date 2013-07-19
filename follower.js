var Follower,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Follower = (function() {
  var status;

  function Follower() {
    this.stopTracking = __bind(this.stopTracking, this);
    this.startTracking = __bind(this.startTracking, this);
  }

  status = 'IDLE';

  Follower.prototype.bind = function() {
    $('.action-button .track').click(this.startTracking);
    return $('.action-button .stop').click(this.stopTracking);
  };

  Follower.prototype.startTracking = function() {
    this.status = 'TRACKING';
    return console.log("Track started");
  };

  Follower.prototype.stopTracking = function() {
    this.status = 'IDLE';
    return console.log("Track stopped");
  };

  return Follower;

})();

if (window.Follower == null) {
  window.Follower = Follower;
}


