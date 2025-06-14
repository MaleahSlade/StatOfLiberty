
DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS players;


CREATE TABLE players (
                         player_id SERIAL PRIMARY KEY,
                         first_name VARCHAR(50) NOT NULL,
                         last_name VARCHAR(50) NOT NULL
);


CREATE TABLE games (
                       game_id SERIAL PRIMARY KEY,
                       opponent VARCHAR(100) NOT NULL,
                       is_home BOOLEAN NOT NULL
);


CREATE TABLE stats (
                       stat_id SERIAL PRIMARY KEY,
                       player_id INT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
                       game_id INT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                       minutes INT CHECK (minutes >= 0),
                       points INT CHECK (points >= 0),
                       rebounds INT CHECK (rebounds >= 0),
                       assists INT CHECK (assists >= 0),
                       steals INT CHECK (steals >= 0),
                       blocks INT CHECK (blocks >= 0)
);