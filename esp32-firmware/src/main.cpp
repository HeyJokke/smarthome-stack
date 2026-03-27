#include "Arduino.h"
#include "WiFi.h"
#include "WebServer.h"
#include "secrets.h"
#include "cstring"
#include "HTTPClient.h"

WebServer server(80);
WiFiClient client;

int LED = 27;
int tempPin = 34;
int photosensPin = 35;

unsigned long uptime_ms;
unsigned long lastPostMs = 0;
char ledStatus[8] = "";
const char* machine_id = "esp32-1";
const char* PI_TELEMETRY_URL = "http://192.168.0.63:3000/telemetry";
String PI_LEDSTATE_URL = "http://192.168.0.63:3000/api/devices/" + String(machine_id) + "/state";
int tempStatus;
int photosens;
int led;

void handleRoot() {
  server.send(200, "text/plain", "Hello from ESP32!");
}

// LED handlers
int readLed() {
  int raw = digitalRead(LED);
  return raw;
}

void postLed() {
  // check wifi status before starting
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("postLed: No internet connection yet.");
    return;
  }

  // read and save state from readLed()
  const int ledStatus = readLed();

  // begin http - hit the endpoint in the pi http://192.168.0.63:3000/api/devices/:id/state
  HTTPClient http;

  http.setTimeout(8000);
  http.setReuse(false);

  http.begin(client, PI_LEDSTATE_URL);
  // set headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Connection", "close");
  // set json header
  String body = "{\"LED\": ";
  body += String(ledStatus);
  body += "}";
  http.addHeader("Content-Length", String(body.length()));

  int code = http.PATCH(String(body));

  // handle errors
  if (code > 0) {
    String response = http.getString();
    Serial.print("postLed: Response = ");
    Serial.println(response);
  } else {
    Serial.print("postLed: Error = ");
    Serial.println(http.errorToString(code));
  }
  // end http
  http.end();
}

void handleLedOff() {
  digitalWrite(LED, LOW);
  strncpy(ledStatus, "OFF", sizeof(ledStatus));
  server.send(200, "application/json", "{\"LED\": \"OFF\"}");
  postLed();
}

void handleLedOn() {
  digitalWrite(LED, HIGH);
  strncpy(ledStatus, "ON", sizeof(ledStatus));
  server.send(200, "application/json", "{\"LED\": \"ON\"}");
  postLed();
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

  server.send(200, "application/json", "{\"LED\": \"BLINKED\"}");
}

// Sensor handlers
float readTemp() {
  int raw = analogRead(tempPin);
  float temperature = ( raw / 4095.0 ) * 100.0;

  return temperature;
}

void handleTemp() {
  float temperature = readTemp();

  String jsonTemp = "{\"Temperature\":" + String(temperature) + "}";
  server.send(200, "application/json", jsonTemp);
}

int readPhotosens() {
  int raw = analogRead(photosensPin);

  return raw;
}

void handlePhotosensitive() {
  int photosens = readPhotosens();

  String jsonPhotosens = "{\"Photosensitivity\": " + String(photosens) + "}";
  server.send(200, "application/json", jsonPhotosens);
}

void handleStatus() {
  tempStatus = readTemp() * 100;
  photosens = readPhotosens();
  uptime_ms = millis();

  String jsonLedStatus = "\"LED\": \"" + String(ledStatus) + "\"";
  String jsonTempStatus = "\"Temperature\": " + String(tempStatus);
  String jsonPhotosens = "\"Photosensitivity\": " + String(photosens);
  String jsonUptimeStatus = "\"Uptime\": " + String(uptime_ms);

  String jsonDeviceStatus = "{";
  jsonDeviceStatus += jsonLedStatus + ",";
  jsonDeviceStatus += jsonTempStatus + ",";
  jsonDeviceStatus += jsonPhotosens + ",";
  jsonDeviceStatus += jsonUptimeStatus;
  jsonDeviceStatus += "}";

  server.send(200, "application/json", jsonDeviceStatus);
}

// HTTP Client
void postTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("postTest: No internet connection yet.");
    return;
  };

  const float temperature = readTemp();
  const int photo_sens = readPhotosens();
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
  String jsonPhotoSens = "\"photo_sens\":" + String(photo_sens);
  String jsonLed = "\"led\":" + String(led);
  String jsonUptimeMs = "\"uptime_ms\":" + String(uptime_ms);

  String body = "{";
  body += jsonMachineId + ",";
  body += jsonTemp + ",";
  body += jsonPhotoSens + ",";
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
    Serial.print("postTest: Response = ");
    Serial.println(response);
  } else {
    Serial.print("postTest: Error: ");
    Serial.println(http.errorToString(code));
  };

  http.end();
}

void setup() {
  Serial.begin(115200);
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
  server.on("/sensor/temp", handleTemp);
  server.on("/sensor/photosens", handlePhotosensitive);

  // Start server
  server.begin();
  Serial.print("\nHTTP server started on ");
  Serial.println(WiFi.localIP());

  postTelemetry();
}

void loop() {
  server.handleClient();

  unsigned long now = millis();

  // Non-blocking loop for POST status
  if (now - lastPostMs >= 30000) {
    lastPostMs = now;
    postTelemetry();
  }

  delay(10);

}