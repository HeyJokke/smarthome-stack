#include "Arduino.h"
#include "WiFi.h"
#include "WebServer.h"
#include "secrets.h"
#include "cstring"
#include "HTTPClient.h"

WebServer server(80);

int LED = 27;
int tempPin = 34;
int photosensPin = 35;

unsigned long uptime_ms;
char ledStatus[8] = "";
const char* PI_TELEMETRY_URL = "http://192.168.0.63:3000/api/telemetry";
int tempStatus;
int photosens;

void handleRoot() {
  server.send(200, "text/plain", "Hello from ESP32!");
}

// LED handlers
void handleLedOff() {
  digitalWrite(LED, LOW);
  strncpy(ledStatus, "OFF", sizeof(ledStatus));
  server.send(200, "application/json", "{\"LED\": \"OFF\"}");
}

void handleLedOn() {
  digitalWrite(LED, HIGH);
  strncpy(ledStatus, "ON", sizeof(ledStatus));
  server.send(200, "application/json", "{\"LED\": \"ON\"}");
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
void postTest() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("postTest: No internet connection yet.");
    return;
  };

  HTTPClient http;
  Serial.println("postTest: HTTP client has been created");

  http.begin(PI_TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");

  const char* body = "{\"temp\": 260}";

  Serial.println("postTest: Sending POST request...");
  int code = http.POST(body);

  Serial.print("postTest: Pi HTTP code = ");
  Serial.println(code);

  String response = http.getString();
  Serial.print("postTest: Response = ");
  Serial.print(response);

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

  // Set up HTTP client
  postTest();
}



void loop() {
  server.handleClient();  
}