package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type Event struct {
	ID         int       `db:"id"`
	Name       string    `db:"name"`
	DateTime   time.Time `db:"datetime"`
	CalendarID int       `db:"calendar_id"`
	UserID     int       `db:"user_id"`
}

var db *sql.DB

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			events, err := getEvents(db)
			if err != nil {
				http.Error(w, "Failed to fetch events", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(events)
		case http.MethodPost:
			var e Event
			if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}
			if err := createEvent(db, e); err != nil {
				http.Error(w, "Failed to create event", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	http.Handle("/api/events", enableCORS(handler))

	log.Fatal(http.ListenAndServe(":4000", nil))
}

func getEvents(db *sql.DB) ([]Event, error) {
	rows, err := db.Query("SELECT id, name, datetime, calendar_id, user_id FROM events")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var e Event
		if err := rows.Scan(&e.ID, &e.Name, &e.DateTime, &e.CalendarID, &e.UserID); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, rows.Err()
}

func createEvent(db *sql.DB, e Event) error {
	query := `
        INSERT INTO events (name, datetime, calendar_id, user_id)
        VALUES ($1, $2, $3, $4)
    `
	_, err := db.Exec(query, e.Name, e.DateTime, e.CalendarID, e.UserID)
	return err
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
