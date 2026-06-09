import db from './db.js'

db.serialize(() => {
    db.run(
        "DROP TABLE IF EXISTS telemetry"
    )

    db.run(
        "DROP TABLE IF EXISTS devices"
    )

    db.run(
        `CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            timestamp_hhmmss TEXT NOT NULL,
            led INT,
            temperature REAL,
            humidity REAL,
            machine_uptime_ms INT NOT NULL,
            payload TEXT
        )`
    )

    db.run(
        `CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            led INT,
            temp REAL,
            humidity REAL,
            last_seen INTEGER,
            UNIQUE(id)
        )`
    )
})