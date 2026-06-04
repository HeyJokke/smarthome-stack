import sqlite3 from "sqlite3"

const db = new sqlite3.Database("data.sqlite")

db.serialize(() => {
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
            UNIQUE(id)
        )`
    )
})

export default db