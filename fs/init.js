load('api_rpc.js');
load('api_arduino_bme280.js');
load('api_timer.js');
load('api_log.js');
load('api_mqtt.js');
load('ready.js');

let zone = Cfg.get('app.zone');
let temp_offset = Cfg.get('app.temp_offset');
let topic = Cfg.get('app.mqtt_topic');
let freq = Cfg.get('app.sample_frequency');
let bme = Adafruit_BME280.create();

function readSensorData() {
  let v, data = {};
  v = bme.readTemperature();
  if (v !== Adafruit_BME280.RES_FAIL) data.temperature = Math.round(v * 90 / 5 + 320 + temp_offset * 10)/10; // C -> F
  v = bme.readHumidity();
  if (v !== Adafruit_BME280.RES_FAIL && v > 0) data.humidity = Math.round(v); // % RH
  v = bme.readPressure();
  if (v !== Adafruit_BME280.RES_FAIL) data.pressure = Math.round(v * 2.9529983071445)/100; // hPa -> inHG
  if (zone > 0) data.zone = zone;
  return data;
}

function logSensorData() {
  let data = readSensorData();
  let s = JSON.stringify(data);
  Log.info("logging to " + topic + ": " + s);
  MQTT.pub(topic, s);
  return data;
}

if (bme.begin(0x76)) {
  RPC.addHandler('Sensors.Read', readSensorData);
  RPC.addHandler('Sensors.Log', logSensorData);
  Timer.set(freq, Timer.REPEAT, logSensorData, null);
} else {
  Log.error("no BME280 sensor found");
}
