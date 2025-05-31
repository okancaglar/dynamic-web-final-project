// src/db/index.js
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const bcrypt  = require('bcryptjs');

let db;

function initDb() {
    const dbPath = path.resolve(__dirname, './FlightTicket.sqlite');
    db = new sqlite3.Database(
        dbPath,
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        err => {
            if (err) {
                console.error('SQLite open error:', err.message);
                process.exit(1);
            }
            console.log('Connected to SQLite at', dbPath);
            runMigrations();
        }
    );
}

function runMigrations() {
    db.serialize(() => {

        db.run(`PRAGMA foreign_keys = ON;`);

        db.run(`
            CREATE TABLE IF NOT EXISTS City (
                                                city_id     INTEGER PRIMARY KEY AUTOINCREMENT,
                                                city_name   TEXT    NOT NULL UNIQUE
            );
        `, report('City'));

        db.run(`
            CREATE TABLE IF NOT EXISTS Flight (
                                                  flight_id        INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  from_city        INTEGER NOT NULL,
                                                  to_city          INTEGER NOT NULL,
                                                  departure_time   TEXT    NOT NULL,
                                                  arrival_time     TEXT    NOT NULL,
                                                  price            REAL    NOT NULL,
                                                  seats_total      INTEGER NOT NULL,
                                                  seats_available  INTEGER NOT NULL,
                                                  FOREIGN KEY(from_city) REFERENCES City(city_id),
                FOREIGN KEY(to_city)   REFERENCES City(city_id)
                );
        `, report('Flight'));

        db.run(`
            CREATE TABLE IF NOT EXISTS Ticket (
                                                  ticket_id         INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  passenger_name    TEXT    NOT NULL,
                                                  passenger_surname TEXT    NOT NULL,
                                                  passenger_email   TEXT    NOT NULL,
                                                  flight_id         INTEGER NOT NULL,
                                                  seat_id       INTEGER NOT NULL,
                                                  FOREIGN KEY(flight_id) REFERENCES Flight(flight_id),
                                FOREIGN KEY(seat_id)   REFERENCES Seat(seat_id)   ON DELETE RESTRICT

                );
        `, report('Ticket'));

        db.run(`CREATE TABLE IF NOT EXISTS Seat (
                  seat_id      INTEGER PRIMARY KEY AUTOINCREMENT,
                  flight_id    INTEGER NOT NULL,
                  seat_number  TEXT    NOT NULL,
                  is_booked    INTEGER NOT NULL DEFAULT 0,   -- 0 = available, 1 = booked
                  FOREIGN KEY(flight_id) REFERENCES Flight(flight_id)
                );
        `, report("Seat"));

        db.run(`
            CREATE TABLE IF NOT EXISTS User (
                                                email     TEXT    PRIMARY KEY,
                                                password  TEXT    NOT NULL,                -- bcrypt hash
                                                is_admin  INTEGER NOT NULL DEFAULT 0       -- 0 = user, 1 = admin
            );
        `, report('User'));

        seedCities();
        seedAdmin();
    });
}

function seedCities() {
    const cityNames = [
        'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya',
        'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
        'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
        'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
        'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
        'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri',
        'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',
        'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
        'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
        'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
        'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun',
        'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
        'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
        'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
        'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan',
        'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
        'Düzce'
    ];

    const stmt = db.prepare(`INSERT OR IGNORE INTO City (city_name) VALUES (?)`);
    cityNames.forEach(name => {
        stmt.run(name, err => {
            if (err) console.error('City seed error:', name, err.message);
        });
    });
    stmt.finalize(err => {
        if (!err) console.log(`Seeded ${cityNames.length} cities`);
    });
}

function seedAdmin() {
    const email = 'admin@test.com';
    const passwordPlain = 'admin123';
    const isAdmin = 1;
    const hashed = bcrypt.hashSync(passwordPlain, 10);

    db.run(
        `INSERT OR IGNORE INTO User (email, password, is_admin) VALUES (?, ?, ?)`,
        [email, hashed, isAdmin],
        err => {
            if (err) console.error('Admin seed error:', err.message);
            else console.log(`Seeded admin user ('${email}') with password 'admin123'`);
        }
    );
}

function report(table) {
    return err => {
        if (err) console.error(`${table} table error:`, err.message);
        else           console.log(`${table} table ready`);
    };
}

module.exports = {
    getDb: () => {
        if (!db){
            initDb();
            return db;
        }
        return db;
    }
};