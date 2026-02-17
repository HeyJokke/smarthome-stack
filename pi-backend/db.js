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
            console.log(rows)
        }
    )
})

export default db