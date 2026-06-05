#include "Arduino.h"
#include "WiFi.h"
#include "WebServer.h"
#include "secrets.h"
#include "cstring"
#include "HTTPClient.h"
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

WebServer server(80);
WiFiClient client;

int LED = 27;
int dhtPin = 4;

DHT_Unified dht(dhtPin, DHT22);

unsigned long uptime_ms;
unsigned long lastStateMs = 0;
unsigned long lastTelemetryMs = 0;
char ledStatus[8] = "";
const char* machine_id = "esp32-1";
const char* PI_TELEMETRY_URL = "http://192.168.0.63:3000/telemetry";
String PI_LEDSTATE_URL = "http://192.168.0.63:3000/api/devices/" + String(machine_id) + "/state";

void handleRoot() {
  server.send(200, "text/plain", "Hello from ESP32!");
}

// Sensor handlers
int readLed() {
  int raw = digitalRead(LED);
  return raw;
}

float readTemp() {
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    Serial.println(F("Error reading temperature!"));
    return -1;
  }

  return event.temperature;
}

float readHumidity() {
  sensors_event_t event;
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println(F("Error reading humidity!"));
    return -1;
  }

  return event.relative_humidity;
}

void postState() {
  // check wifi status before starting
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("postState: No internet connection yet.");
    return;
  }

  const int led = readLed();
  const float humidity = readHumidity();
  const float temperature = readTemp();

  // begin http - hit the endpoint in the pi http://192.168.0.63:3000/api/devices/:id/state
  HTTPClient http;

  http.setTimeout(8000);
  http.setReuse(false);

  http.begin(client, PI_LEDSTATE_URL);
  // set headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Connection", "close");
  // set json header
  String jsonLed = "\"led\":" + String(led);
  String jsonTemp = "\"temperature\":" + String(temperature, 2);
  String jsonHumidity = "\"humidity\":" + String(humidity, 2);

  String jsonDeviceState = "{";
  jsonDeviceState += jsonLed + ",";
  jsonDeviceState += jsonTemp + ",";
  jsonDeviceState += jsonHumidity;
  jsonDeviceState += "}";

  http.addHeader("Content-Length", String(jsonDeviceState.length()));

  int code = http.PATCH(String(jsonDeviceState));

  // handle errors
  if (code > 0) {
    String response = http.getString();
    Serial.print("postState: Response = ");
    Serial.println(response);
  } else {
    Serial.print("postState: Error = ");
    Serial.println(http.errorToString(code));
  }
  // end http
  http.end();
}

void handleLedOff() {
  digitalWrite(LED, LOW);
  strncpy(ledStatus, "OFF", sizeof(ledStatus));
  server.send(200, "application/json", "{\"led\": \"OFF\"}");
  postState();
}

void handleLedOn() {
  digitalWrite(LED, HIGH);
  strncpy(ledStatus, "ON", sizeof(ledStatus));
  server.send(200, "application/json", "{\"led\": \"ON\"}");
  postState();
}

void handleLedBlink() {
  digitalWrite(LED, LOW);
  delay(200);
  digitalWrite(LED, HIGH);
  delay(200);
  digitalWrite(LED, LOW);
  delay(200);
  digitalWrite(LED, HIGH);
  delay(200);
  digitalWrite(LED, LOW);
  delay(200);
  digitalWrite(LED, HIGH);
  delay(200);
  digitalWrite(LED, LOW);

  server.send(200, "application/json", "{\"led\": \"BLINKED\"}");
}

void handleTemp() {
  float temperature = readTemp();

  String jsonTemp = "{\"Temperature\":" + String(temperature) + "}";
  server.send(200, "application/json", jsonTemp);
}


void handleHumidity() {
  float humidity = readHumidity();

  String jsonTemp = "{\"Humidity\":" + String(humidity) + "}";
  server.send(200, "application/json", jsonTemp);
}

void handleStatus() {
  const float temperature = readTemp();
  const float humidity = readHumidity();
  uptime_ms = millis();

  String jsonLedStatus = "\"led\": \"" + String(ledStatus) + "\"";
  String jsonTempStatus = "\"temperature\": " + String(temperature, 2);
  String jsonHumidityStatus = "\"humidity\": " + String(humidity, 2);
  String jsonUptimeStatus = "\"uptime\": " + String(uptime_ms);

  String jsonDeviceStatus = "{";
  jsonDeviceStatus += jsonLedStatus + ",";
  jsonDeviceStatus += jsonTempStatus + ",";
  jsonDeviceStatus += jsonHumidityStatus + ",";
  jsonDeviceStatus += jsonUptimeStatus;
  jsonDeviceStatus += "}";

  server.send(200, "application/json", jsonDeviceStatus);
}

void postTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("postTelemetry: No internet connection yet.");
    return;
  };

  const float humidity = readHumidity();
  const float temperature = readTemp();
  const int led = readLed();
  uptime_ms = millis();

  HTTPClient http;

  http.setTimeout(8000);
  http.setReuse(false);

  http.begin(client, PI_TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Connection", "close");

  String jsonMachineId = "\"machine_id\":\"" + String(machine_id) + "\"";
  String jsonTemp = "\"temperature\":" + String(temperature, 2);
  String jsonHumidity = "\"humidity\":" + String(humidity, 2);
  String jsonLed = "\"led\":" + String(led);
  String jsonUptimeMs = "\"uptime_ms\":" + String(uptime_ms);

  String body = "{";
  body += jsonMachineId + ",";
  body += jsonTemp + ",";
  body += jsonHumidity + ",";
  body += jsonLed + ",";
  body += jsonUptimeMs;
  body += "}";

  Serial.print(body.length());
  Serial.println(body);

  http.addHeader("Content-Length", String(body.length()));

  int code = http.POST(body);

  Serial.print("Pi HTTP Code => ");
  Serial.println(code);

  // Error code
  if (code > 0) {
    String response = http.getString();
    Serial.print("postTelemetry: Response = ");
    Serial.println(response);
  } else {
    Serial.print("postTelemetry: Error: ");
    Serial.println(http.errorToString(code));
  };

  http.end();
}

void setup() {
  Serial.begin(115200);

  dht.begin();
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);

  delay(1000);
  Serial.println("=== SETUP STARTED ===");
  // Analog read resolution 0-4095
  analogReadResolution(12);

  // Pinmode & initialize LED
  pinMode(LED, OUTPUT);
  strncpy(ledStatus, "OFF", sizeof(ledStatus));
  digitalWrite(LED, LOW);

  // Set up WiFi connection
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  Serial.print("...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  Serial.print("\nYou are connected to ");
  Serial.println(WIFI_SSID);

  // Set up endpoints
  server.on("/", handleRoot);
  // Status endpoint
  server.on("/status", handleStatus);
  // LED endpoints
  server.on("/led/on", handleLedOn);
  server.on("/led/off", handleLedOff);
  server.on("/led/blink", handleLedBlink);
  // Sensor endpoints
  server.on("/sensor/temperature", handleTemp);
  server.on("/sensor/humidity", handleHumidity);

  // Start server
  server.begin();
  Serial.print("\nHTTP server started on ");
  Serial.println(WiFi.localIP());

  postTelemetry();
}

void loop() {
  server.handleClient();

  unsigned long now = millis();

  if (now - lastStateMs >= 30000) {
    lastStateMs = now;
    postState();
  }

  if (now - lastTelemetryMs >= 300000) {
    lastTelemetryMs = now;
    postTelemetry();
  }

  delay(10);

}