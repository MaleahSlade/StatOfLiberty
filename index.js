const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { Pool } = require('pg');
const app = express();

const host = 'localhost';
const port = 8080;

const db = {
    user: 'maleahslade',
    host: 'localhost',
    database: 'New York Liberty 2025 Player Stats',
    password: 'Titus4242*',
    port: 5432,
};

const pool = new Pool(db);

app.engine('hbs', engine({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/stats', (req, res) => res.render('stats'));

app.get('/players', (req, res) => {
    pool.query('SELECT * FROM players ORDER BY first_name, last_name ', (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json(results.rows);
    });
});

app.post('/submit-stats', async (req, res) => {
    const {
        player_id,
        opponent,
        is_home,
        minutes,
        points,
        rebounds,
        assists,
        steals,
        blocks
    } = req.body;

    try {
        const gameResult = await pool.query(
            `INSERT INTO games (opponent, is_home)
             VALUES ($1, $2)
             ON CONFLICT (opponent, is_home) DO NOTHING
             RETURNING game_id`,
            [opponent, is_home]
        );

        let game_id;
        if (gameResult.rows.length > 0) {
            game_id = gameResult.rows[0].game_id;
        } else {
            const existingGame = await pool.query(
                `SELECT game_id FROM games WHERE opponent = $1 AND is_home = $2`,
                [opponent, is_home]
            );
            game_id = existingGame.rows[0].game_id;
        }


        await pool.query(
            `INSERT INTO stats (player_id, stat_id, minutes, points, rebounds, assists, steals, blocks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [player_id, game_id, minutes, points, rebounds, assists, steals, blocks]
        );

        res.status(200).json({ message: 'Stats submitted successfully!' });
    } catch (error) {
        console.error('Error inserting stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/stats-data', async (req, res) => {
    const { opponent, is_home } = req.query;

    if (!opponent || is_home === undefined) {
        return res.status(400).json({ error: 'Missing opponent or is_home query parameter' });
    }

    try {
        const result = await pool.query(
            `SELECT 
                p.first_name || ' ' || p.last_name AS player_name,
                g.opponent,
                g.is_home,
                s.minutes,
                s.points,
                s.rebounds,
                s.assists,
                s.steals,
                s.blocks
             FROM stats s
             JOIN players p ON s.player_id = p.player_id
             JOIN games g ON s.stat_id = g.game_id
             WHERE g.opponent = $1 AND g.is_home = $2`,
            [opponent, is_home]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
});

