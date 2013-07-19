class FollowerLogger

  @log: (message) ->
    console.log "Follower logger", message
    entry = $('<p class="console-entry">').text(message)
    $('.console-holder').prepend(entry)
    

class Follower
  
  status = 'IDLE'
  
  contructor: ()->
    @log = Follower.log

  bind: ()->
    $('.action-button .track').click(@startTracking)
    $('.action-button .stop').click(@stopTracking)
  
  startTracking: ()=>
    @status = 'TRACKING'
    @log "Track started"


  stopTracking: ()=>
    @status = 'IDLE'
    @log "Track stopped"

window.Follower ?= Follower