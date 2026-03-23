import sqlite3 from "sqlite3"

const db = new sqlite3.Database("data.sqlite")

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            led INT,
            temperature REAL,
            machine_uptime_ms INT NOT NULL,
            photo_sens INT NOT NULL,
            payload TEXT
        )`
    )
})

export default db