import pool from '../database/connection.js';

const createEvent = async (req, res) => {
  const { title, datetime, location, capacity } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title required' });
  }

  if (!datetime || isNaN(Date.parse(datetime)) || new Date(datetime) <= new Date()) {
    return res.status(400).json({ error: 'date time must be valid in the formt like YYYY-MM-DDTHH:MM:SS' });
  }

  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Location required' });
  }

  if (
    capacity === undefined ||
    typeof capacity !== 'number' ||
    capacity <= 0 ||
    capacity > 1000
  ) {
    return res.status(400).json({ error: 'Capacity must be between 1 and 1000' });
  }

  try {
    // console.log("this is working")
    const result = await pool.query(
      'INSERT INTO events (title, datetime, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, datetime, location, capacity]
    );
    // console.log("this is result ",result)
    res.status(201).json({ eventId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

const getEventDetails = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const users = await pool.query(`
      SELECT users.id, users.name, users.email
      FROM registrations
      JOIN users ON registrations.user_id = users.id
      WHERE registrations.event_id = $1
    `, [eventId]);

    // console.log("checking users",users)
    res.json({ ...event.rows[0], registeredUsers: users.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
};


const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'userId is invalid' });
  }

  try {
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const now = new Date();
    const eventDate = new Date(event.rows[0].datetime);
    if (eventDate < now) return res.status(400).json({ error: 'Cannot register for past events' });

    const existing = await pool.query('SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',[userId, eventId]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'User already registered' });

    // console.log("checking for exisiting",existing)

    const count = await pool.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1',[eventId]);
    // console.log("checking for count",count)
    if (parseInt(count.rows[0].count) >= event.rows[0].capacity)
      return res.status(400).json({ error: 'Event is already full' });

    await pool.query('INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)',[userId, eventId]);

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

const cancelRegistration = async (req, res) => {
  const { id: eventId, userId } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',[userId, eventId]);

    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not registered' });

    await pool.query('DELETE FROM registrations WHERE user_id = $1 AND event_id = $2',[userId, eventId]);

    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};


const listUpcomingEvents = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE datetime > NOW() 
       ORDER BY datetime ASC, location ASC`
    );
    // console.log("result",result)

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};

const getEventStats = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await pool.query('SELECT capacity FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const capacity = event.rows[0].capacity;

    const result = await pool.query('SELECT COUNT(*)::int as total FROM registrations WHERE event_id = $1',[eventId]);

    const total = result.rows[0].total;
    const remaining = capacity - total;
    const percent = ((total / capacity) * 100).toFixed(2);

    res.json({
      totalRegistrations: total,
      remainingCapacity: remaining,
      capacityUsedPercent: parseFloat(percent),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event stats' });
  }
};


export {createEvent,getEventDetails,registerForEvent,cancelRegistration,listUpcomingEvents,getEventStats}
