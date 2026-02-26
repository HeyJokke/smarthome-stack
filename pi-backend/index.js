import express from 'express'
import db from './db.js'
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { fetchWithRetry } from './utils/fetchWithRetry.js';

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json())

const DEVICES = {
	livingroom: { baseUrl: "http://192.168.0.70" },
	kitchen: { baseUrl: "http://192.168.0.71" },
	office: { baseUrl: "http://192.168.0.72" }
}

function getDeviceOr404(id, res) {
	const device = DEVICES[id]
	if (!device) {
		res.status(404).json({ error: `ERROR 404: Device: ${id} not found` })
		return null
	}
	return device
}

app.all(/^\/esp32(\/.*)?$/, async (req, res) => {
  try {
    const ESP_BASE = "http://192.168.0.70";

    const targetPath = req.originalUrl.replace(/^\/esp32/, "") || "/";

    const response = await fetch(`${ESP_BASE}${targetPath}`, {
      method: req.method,
      headers: { "content-type": req.headers["content-type"] ?? "application/json" },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);

    res.status(response.status).send(await response.text());
  } catch (err) {
    console.error("ESP proxy error:", err);
    res.status(502).json({ error: "ESP32 unreachable" });
  }
});

// ----------------GET Endpoints----------------
// Status from all devices
app.get('/api/devices/:id/status', (req, res) => {
	const device = getDeviceOr404(req.params.id, res)
	if (!device) return

	try {
		const res = fetchWithRetry(`${device.baseUrl}/status`)

		if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

		const data = res.json()

		console.log(data)

	} catch(err) {
		console.error(`ERROR: ${req.params.id} connection failed: ${err.message}`)
		res.status(502).json({ error: err.message })
	}
})

// Latest telemetry
app.get('/telemetry/latest', (req, res) => {
	db.get(
		'SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 1',
		function (err, row) {
			if (err) return res.status(500).json({ ok: false, payload: null, error: err.message })
			if (!row) return res.status(404).json({ ok: false, payload: null, error: 'ERROR 404 row could not fetch row data, possibly no connection to the DB or there are no rows'})
				
			return res.status(200).json({ 
				ok: true, 
				payload: {
					...row,
					payload_obj: JSON.parse(row.payload)
				}, 
				error: null 
			})
		}
	)
})

// Telemetry entries with limit
app.get('/telemetry', (req, res) => {
	let limit = Number(req.query.limit ?? 0)

	if (!Number.isFinite(limit) || limit <= 0) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Add a valid query ?limit to the request... ?limit=(number > 0)'})
	}

	if (limit > 1000) limit = 1000

	db.all(
		`SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT (?)`,
		[limit],
		(err, rows) => {
			if (err) {
				return res.status(500).json({ ok: false, payload: null, error: err.message })
			}

			const rowsMapped = (rows ?? []).map((row) => {
				return {
					...row,
					payload_obj: JSON.parse(row.payload)
				}
			})

			return res.status(200).json({
				ok: true,
				payload: rowsMapped,
				error: null
			})
		}
	)
})

// ----------------POST Endpoints----------------
// Telemetry
app.post('/telemetry', (req, res) => {
	const {machine_id, temperature, photo_sens, uptime_ms} = req.body
	const timestamp_iso = new Date().toISOString()
	const timestamp_ms = Date.now()

	console.log("POST /telemetry content-type:", req.headers["content-type"])
	console.log("POST /telemetry raw body:", req.body)
	
	// Check for not null constraints and types
	const machineId = typeof machine_id === 'string' ? machine_id.trim() : ''
	if (!machineId) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Machine_id not correctly defined' })
	}

	if (!Number.isFinite(timestamp_ms)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Server timestamp failed' })
	}

	const temp = temperature === undefined || temperature === null ? null : Number(temperature)
	if (temp === null || !Number.isFinite(temp)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Temperature is either NULL or not a number' })
	}

	const uptimeMs = uptime_ms === undefined || uptime_ms === null ? null : Number(uptime_ms)
	if (uptimeMs === null || !Number.isFinite(uptimeMs)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Uptime_ms is either NULL or not a number' })
	}

	const photoSens = photo_sens === undefined || photo_sens === null ? null : Number(photo_sens)
	if (photoSens === null || !Number.isFinite(photoSens)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Photosensitivity is either NULL or not a number' })
	}

	const canonicalPayload = {
		machine_id: machineId, // device ID of which the payload came from
		timestamp: timestamp_ms, // server event time
		timestamp_iso, // human readable event time from server
		machine_uptime_ms: uptimeMs, // uptime in ms of device
		photo_sens: photoSens, // photo sensitivity sensor value from device
		temperature: temp // temperature sensor value from device
	}

	// Include modified or extra values in payload
	const payload = JSON.stringify(canonicalPayload)
	
	db.run(
		'INSERT INTO telemetry(machine_id, timestamp, temperature, machine_uptime_ms, photo_sens, payload) VALUES (?, ?, ?, ?, ?, ?)',
		[machineId, timestamp_ms, temp, uptimeMs, photoSens, payload ?? null],
		function (err) {
			if (err) return res.status(500).json({ ok: false, payload: null ,error: err.message })

			return res.status(201).json({ ok: true, 
				payload: {
					id: this.lastID,
					...canonicalPayload
				}, error: null })
		}
	)
})

// Serve dashboard build
const distPath = path.join(__dirname, "../dashboard/dist");
app.use(express.static(distPath));

app.listen(3000, () => {
	console.log('Server running on http://192.168.0.63:3000')
})