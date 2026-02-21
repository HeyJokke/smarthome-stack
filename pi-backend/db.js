import sqlite3 from "sqlite3"

const db = new sqlite3.Database("data.sqlite")

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value TEXT
        )   
    `)

    db.run(
        "INSERT INTO test (value) VALUES (?)",
        ["hello"],
        function (err) {
            if (err) return console.error(err.message)
            console.log("Inserted row with id:", this.lastID)
        }
    )

    db.run(
        "SELECT * FROM test", (err, rows) => {
            if (err) console.error(err.message)
        }
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

export default db