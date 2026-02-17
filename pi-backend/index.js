import express from 'express'
import db from './db.js'

const app = express()

app.use(express.json())

// GET Endpoint
app.get('/test', (req, res) => {
	db.all('SELECT * FROM test', (err, rows) => {
		if (err) return res.status(500).json({ error: err.message })
		res.json(rows)
	})
})

// POST Endpoint
app.post('/test', (req, res) => {
	const value = req.body?.value
	console.log(value)
	if (typeof value !== 'string' || value.trim() === '') {
		console.log(typeof value)
		return res.status(400).json({ ok: false, ID: null, error: 'Value must be a non-empty string' })
	}

	db.run(
		'INSERT INTO test (value) VALUES (?)',
		[value.trim()],
		function (err) {
			if (err) return res.status(500).json({ ok: false, ID: null, error: 'Could not return value from database' })

			return res.status(201).json({ ok: true, ID: this.lastID, error: null })
		}
	)
})

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000')
})