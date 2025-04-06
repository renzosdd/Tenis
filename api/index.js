const express = require('express');
const serverless = require('serverless-http');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('padeltenis');
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}

connectToDatabase().catch(err => console.error(err));

// Middleware para verificar la conexión a la DB
const ensureDbConnection = (req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'Base de datos no conectada' });
  }
  req.db = db;
  next();
};

app.get('/api/tournaments', ensureDbConnection, async (req, res) => {
  try {
    const tournaments = await req.db.collection('tournaments').find().toArray();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});

app.post('/api/tournaments', ensureDbConnection, async (req, res) => {
  try {
    const tournament = req.body;
    const result = await req.db.collection('tournaments').insertOne(tournament);
    res.status(201).json({ _id: result.insertedId, ...tournament });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear torneo' });
  }
});

app.put('/api/tournaments/:id', ensureDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTournament = req.body;
    const result = await req.db.collection('tournaments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedTournament }
    );
    if (result.modifiedCount === 1) {
      res.json(updatedTournament);
    } else {
      res.status(404).json({ error: 'Torneo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar torneo' });
  }
});

app.delete('/api/tournaments/:id', ensureDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await req.db.collection('tournaments').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Torneo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar torneo' });
  }
});

app.get('/api/players', ensureDbConnection, async (req, res) => {
  try {
    const players = await req.db.collection('players').find().toArray();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

app.post('/api/players', ensureDbConnection, async (req, res) => {
  try {
    const player = req.body;
    const result = await req.db.collection('players').insertOne(player);
    res.status(201).json({ _id: result.insertedId, ...player });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear jugador' });
  }
});

module.exports = serverless(app);