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

	const payload = JSON.stringify({...req.body, timestamp_iso})

	// Check for not null constraints and types
	if (typeof machine_id !== 'string' || !machine_id.trim() || !timestamp_ms) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Machine_id not correctly defined'})
	}
	if (!timestamp_ms || !Number.isFinite(timestamp_ms)) {
		return res.status(400).json({ ok: false, payload: null, error: 'ERROR: Server timestamp failed'})
	}

	db.run(
		'INSERT INTO telemetry(machine_id, timestamp, temperature, payload) VALUES (?, ?, ?, ?)',
		[machine_id, timestamp_ms, temperature ?? null, payload ?? null],
		function (err) {
			if (err) return res.status(500).json({ ok: false, payload: null ,error: err.message })

			return res.status(201).json({ ok: true, 
				payload: {
					id: this.lastID,
					machine_id: machine_id.trim(),
					timestamp: timestamp_ms,
					temperature: temperature ?? null
				}, error: null })
		}
	)
})

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000')
})