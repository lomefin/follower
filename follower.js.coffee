class Follower
  
  status = 'IDLE'
  

  bind: ()->
    $('.action-button .track').click(@startTracking)
    $('.action-button .stop').click(@stopTracking)
  
  startTracking: ()=>
    @status = 'TRACKING'
    console.log "Track started"


  stopTracking: ()=>
    @status = 'IDLE'
    console.log "Track stopped"

window.Follower ?= Follower

