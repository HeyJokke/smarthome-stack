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
            last_seen INTEGER DEFAULT 0,
            live INTEGER DEFAULT 0,
            UNIQUE(id)
        )`
    )

    db.run(
        `ALTER TABLE devices 
        ADD COLUMN live INTEGER DEFAULT 0`,
        (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Migration failed:', err.message)
            }
        }
    )

})

export default db