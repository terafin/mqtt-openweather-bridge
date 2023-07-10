# mqtt-openweather-bridge

This is a simple docker container that I use to bridge to/from my MQTT bridge.

I have a collection of bridges, and the general format of these begins with these environment variables:

```yaml
      TOPIC_PREFIX: /your_topic_prefix  (eg: /some_topic_prefix/somthing)
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
```

Here's an example docker compose:

```yaml
version: '3.3'
services:
  mqtt-openweather-bridge:
    image: ghcr.io/terafin/mqtt-openweather-bridge:latest
    environment:
      LOGGING_NAME: mqtt-openweather-bridge
      TZ: America/Los_Angeles
      TOPIC_PREFIX: /your_topic_prefix  (eg: /environment/weather)
      OPENWEATHER_API_KEY: YOUR_API_KEY
      OPENWEATHER_LAT: LAT
      OPENWEATHER_LONG: LONG
      (OPTIONAL) OPENWEATHER_LANGUAGE: en
      (OPTIONAL) OPENWEATHER_POLL_INTERVAL: 300 (seconds, 5 mins by default)
      (OPTIONAL) OPENWEATHER_UNITS: standard (metric by default)
      HEALTH_CHECK_PORT: "3001"
      HEALTH_CHECK_TIME: "120"
      HEALTH_CHECK_URL: /healthcheck
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
```

Here's an example publish for my setup:

```log
/openweather/lat:XXXX
/openweather/lon:XXXX
/openweather/timezone:America/Los_Angeles
/openweather/timezone_offset:-25200
/openweather/current/dt:1681698177
/openweather/current/sunrise:1681651941
/openweather/current/sunset:1681699424
/openweather/current/temp:13.47
/openweather/current/feels_like:12.54
/openweather/current/pressure:1018
/openweather/current/humidity:64
/openweather/current/dew_point:6.8
/openweather/current/uvi:0.17
/openweather/current/clouds:0
/openweather/current/visibility:10000
/openweather/current/wind_speed:8.23

```
