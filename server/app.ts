import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup db
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});

// Create table
db.run(
  `CREATE TABLE data(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT,
    wins INTEGER,
    losses INTEGER,
    draws INTEGER
)`,
  (err) => {
    if (err) {
      console.error("Error creating table", err);
    } else {
      console.log("Created table");
      // Initialise data
      db.run(
        "INSERT INTO data(player, wins, losses, draws) VALUES('X', 0, 0, 0)",
        (err) => {
          if (err) {
            console.error("Error inserting data", err);
          }
        }
      );
      db.run(
        "INSERT INTO data(player, wins, losses, draws) VALUES('O', 0, 0, 0)",
        (err) => {
          if (err) {
            console.error("Error inserting data", err);
          }
        }
      );
    }
  }
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Handle GET request to /data
app.get("/data", (req, res) => {
  db.all("SELECT * FROM data", (err, rows) => {
    if (err) {
      console.error("Error getting data", err);
      res.status(500).send("Error getting data");
    } else {
      res.json(rows);
    }
  });
});

// Handle GET request to /data/:player
app.get("/data/:player", (req, res) => {
  const player = req.params.player;
  db.get("SELECT * FROM data WHERE player = ?", player, (err, row) => {
    if (err) {
      console.error("Error getting player", err);
      res.status(500).send("Error getting player");
    } else if (row === undefined) {
      res.status(400).send("Player does not exist");
    } else {
      res.json(row);
    }
  });
});

// Handle POST request to /data/:player
app.post("/data/:player", (req, res) => {
  const player = req.params.player;
  const win = req.body.win || false;
  const loss = req.body.loss || false;
  const draw = req.body.draw || false;
  // Check player exists
  db.get("SELECT * FROM data WHERE player = ?", player, (err, row) => {
    if (err) {
      console.error("Error checking player", err);
      res.status(500).send("Error checking player");
    } else if (row === undefined) {
      res.status(400).send("Player does not exist");
    } else {
      if (win) {
        db.run(
          "UPDATE data SET wins = wins + 1 WHERE player = ?",
          player,
          (err: any) => {
            if (err) {
              console.error("Error updating data", err);
              res.status(500).send("Error updating data");
            } else {
              res.send(`{"status" : "success", "message" : "Updated wins"}`);
            }
          }
        );
      } else if (loss) {
        db.run(
          "UPDATE data SET losses = losses + 1 WHERE player = ?",
          player,
          (err: any) => {
            if (err) {
              console.error("Error updating data", err);
              res.status(500).send("Error updating data");
            } else {
              res.send(`{"status" : "success", "message" : "Updated losses"}`);
            }
          }
        );
      } else if (draw) {
        db.run(
          "UPDATE data SET draws = draws + 1 WHERE player = ?",
          player,
          (err: any) => {
            if (err) {
              console.error("Error updating data", err);
              res.status(500).send("Error updating data");
            } else {
              res.send(`{"status" : "success", "message" : "Updated draws"}`);
            }
          }
        );
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running");
});
