import db from './db.js'

db.serialize(() => {
    db.run(
        "DROP TABLE IF EXISTS telemetry"
    )

    db.run(
        `CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            temperature REAL,
            machine_uptime_ms INT NOT NULL,
            photo_sens INT NOT NULL,
            payload TEXT
        )`
    )
})