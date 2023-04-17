const mqtt = require('mqtt')
const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')
const interval = require('interval-promise')
const health = require('homeautomation-js-lib/health.js')
const got = require('got')
const mqtt_helpers = require('homeautomation-js-lib/mqtt_helpers.js')

// Config
var topic_prefix = process.env.TOPIC_PREFIX
var OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
var OPENWEATHER_LAT = process.env.OPENWEATHER_LAT
var OPENWEATHER_LONG = process.env.OPENWEATHER_LONG
var OPENWEATHER_LANGUAGE = process.env.OPENWEATHER_LANGUAGE
var OPENWEATHER_POLL_INTERVAL = process.env.OPENWEATHER_POLL_INTERVAL
var OPENWEATHER_UNITS = process.env.OPENWEATHER_UNITS

if (_.isNil(topic_prefix)) {
    logging.warn('TOPIC_PREFIX not set, not starting')
    process.abort()
}

if (_.isNil(OPENWEATHER_API_KEY)) {
    logging.warn('OPENWEATHER_API_KEY not set, not starting')
    process.abort()
}

if (_.isNil(OPENWEATHER_LAT)) {
    logging.warn('OPENWEATHER_LAT not set, not starting')
    process.abort()
}

if (_.isNil(OPENWEATHER_LONG)) {
    logging.warn('OPENWEATHER_LONG not set, not starting')
    process.abort()
}

if (_.isNil(OPENWEATHER_LANGUAGE)) {
    OPENWEATHER_LANGUAGE = "en"
}

if (_.isNil(OPENWEATHER_UNITS)) {
    OPENWEATHER_UNITS = "metric"
}

if (_.isNil(OPENWEATHER_POLL_INTERVAL)) {
    OPENWEATHER_POLL_INTERVAL = 300
}

var mqttOptions = {}

var shouldRetain = process.env.MQTT_RETAIN

if (_.isNil(shouldRetain)) {
    shouldRetain = true
}

if (!_.isNil(shouldRetain)) {
    mqttOptions['retain'] = shouldRetain
}

var connectedEvent = function() {
    health.healthyEvent()
}

var disconnectedEvent = function() {
    health.unhealthyEvent()
}

// Setup MQTT
const client = mqtt_helpers.setupClient(connectedEvent, disconnectedEvent)

async function query_one_api(callback) {
    const urlPrefix = "https://api.openweathermap.org/data/3.0/onecall?"
    var url = urlPrefix

    url = url + "lat=" + OPENWEATHER_LAT
    url = url + "&lon=" + OPENWEATHER_LONG
    url = url + "&appid=" + OPENWEATHER_API_KEY
    url = url + "&lang=" + OPENWEATHER_LANGUAGE
    url = url + "&units=" + OPENWEATHER_UNITS

    logging.info('openweather url: ' + url)
    var error = null
    var body = null

    try {
        const response = await got.get(url)
        body = JSON.parse(response.body)
    } catch (e) {
        logging.error('failed querying host: ' + e)
        error = e
    }

    if (!_.isNil(callback)) {
        return callback(error, body)
    }
}

const doPoll = function() {
    query_one_api(function(err, result) {
        if (!_.isNil(err)) {
            health.unhealthyEvent()
            return
        }
        logging.info('result: ' + JSON.stringify(result))

        client.smartPublishCollection(topic_prefix, result, ['minutely', 'hourly', 'daily', 'weather'], mqttOptions)
        const minutely = result.minutely
        const hourly = result.hourly
        const daily = result.daily

        var index = 0
        minutely.forEach(element => {
            client.smartPublishCollection(mqtt_helpers.generateTopic(topic_prefix, 'forecast', 'minutely', index), element, ['weather'], mqttOptions)
            index++
        })
        
        index = 0
        hourly.forEach(element => {
            client.smartPublishCollection(mqtt_helpers.generateTopic(topic_prefix, 'forecast', 'hourly', index), element, ['weather'], mqttOptions)
            var rain = element.rain
            var snow = element.snow
            if ( _.isNil(rain) ) {
                rain = {}
                rain['1h'] = 0
                rain['3h'] = 0
                client.smartPublishCollection(mqtt_helpers.generateTopic(topic_prefix, 'forecast', 'hourly', index, 'rain'), rain, ['weather'], mqttOptions)
            }
            if ( _.isNil(snow) ) {
                snow = {}
                snow['1h'] = 0
                snow['3h'] = 0
                client.smartPublishCollection(mqtt_helpers.generateTopic(topic_prefix, 'forecast', 'hourly', index, 'snow'), snow, ['weather'], mqttOptions)
            }
            index++
        })

        index = 0
        daily.forEach(element => {
            client.smartPublishCollection(mqtt_helpers.generateTopic(topic_prefix, 'forecast', 'daily', index), element, ['weather'], mqttOptions)
            index++
        })
        health.healthyEvent()
    })
}

const startHostCheck = function() {
    logging.info('Starting to monitor: ' + OPENWEATHER_LAT + ', ' + OPENWEATHER_LONG)

    interval(async() => {
        doPoll()
    }, OPENWEATHER_POLL_INTERVAL * 1000)
    doPoll()
}

startHostCheck()