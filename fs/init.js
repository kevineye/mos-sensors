load('api_rpc.js');
load('api_timer.js');
load('api_log.js');
load('ready.js');

Timer.set(1000, Timer.REPEAT, function() {
  Log.info("ping!");
}, null);
