import express from 'express'
import db from './db.js'

const app = express()

app.use(express.json())

// GET Endpoint for latest telemetry
app.get('/telemetry/latest', (req, res) => {
	db.get(
		'SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 1',
		function (err, row) {
			if (err) return res.status(500).json({ ok: false, payload: null, error: err.message })
			if (!row) return res.status(404).json({ ok: false, payload: null, error: 'ERROR 404 row could not fetch row data, possibly no connection to the DB or there are no rows'})
			return res.status(200).json({ ok: true, payload: row, error: null })
		}
	)
})

// POST Endpoint for telemetry
app.post('/telemetry', (req, res) => {
	const {machine_id, temperature} = req.body
	const timestamp_iso = new Date().toISOString()
	const timestamp_ms = Date.now()

	console.log("POST /telemetry content-type:", req.headers["content-type"])
	console.log("POST /telemetry raw body:", req.body)
	
	// Check for not null constraints and types
	const machineId = typeof machine_id === 'string' ? machine_id.trim() : ''
	if (!machineId) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Machine_id not correctly defined'})
	}
	if (!Number.isFinite(timestamp_ms)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Server timestamp failed'})
	}
	const temp = temperature === undefined || temperature === null ? null : Number(temperature)
	if (temp === null || !Number.isFinite(temp)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Temperature is either NULL or not a number'})
	}

	const payload = JSON.stringify({...req.body, machine_id: machineId, timestamp_iso})
	
	db.run(
		'INSERT INTO telemetry(machine_id, timestamp, temperature, payload) VALUES (?, ?, ?, ?)',
		[machineId, timestamp_ms, temp, payload ?? null],
		function (err) {
			if (err) return res.status(500).json({ ok: false, payload: null ,error: err.message })

			return res.status(201).json({ ok: true, 
				payload: {
					id: this.lastID,
					machine_id: machineId,
					timestamp: timestamp_ms,
					temperature: temp
				}, error: null })
		}
	)
})

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000')
})