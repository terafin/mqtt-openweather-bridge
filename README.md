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
    image: terafin/mqtt-openweather-bridge:latest
    environment:
      LOGGING_NAME: mqtt-openweather-bridge
      TZ: America/Los_Angeles
      TOPIC_PREFIX: /your_topic_prefix  (eg: /environment/weather)
      OPENWEATHER_API_KEY: YOUR_API_KEY
      OPENWEATHER_LAT: LAT
      OPENWEATHER_LONG: LONG
      (OPTIONAL) OPENWEATHER_LANGUAGE: en
      (OPTIONAL) OPENWEATHER_POLL_INTERVAL: 300 (seconds, 5 mins by default)
      HEALTH_CHECK_PORT: "3001"
      HEALTH_CHECK_TIME: "120"
      HEALTH_CHECK_URL: /healthcheck
      MQTT_HOST: YOUR_MQTT_URL (eg: mqtt://mqtt.yourdomain.net)
      (OPTIONAL) MQTT_USER: YOUR_MQTT_USERNAME
      (OPTIONAL) MQTT_PASS: YOUR_MQTT_PASSWORD
```

Here's an example publish for my setup:

```log
/environment/air/pm1_0_cf_1_b 8.51
/environment/air/p_2_5_um_b 7.79
/environment/air/YOUR_STATION_NUMBER/p_2_5_um 11.21
/environment/air/YOUR_STATION_NUMBER/pm1_0_atm 8.83
```
