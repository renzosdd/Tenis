const express = require('express');
const serverless = require('serverless-http');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI; // Se configurará en Vercel
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('padeltenis');
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
}

connectToDatabase();

// GET: Obtener todos los torneos
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await db.collection('tournaments').find().toArray();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});

// POST: Crear un torneo
app.post('/api/tournaments', async (req, res) => {
  try {
    const tournament = req.body;
    const result = await db.collection('tournaments').insertOne(tournament);
    res.status(201).json({ _id: result.insertedId, ...tournament });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear torneo' });
  }
});

// PUT: Actualizar un torneo
app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTournament = req.body;
    const result = await db.collection('tournaments').updateOne(
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

// DELETE: Eliminar un torneo
app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('tournaments').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Torneo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar torneo' });
  }
});

// GET: Obtener todos los jugadores
app.get('/api/players', async (req, res) => {
  try {
    const players = await db.collection('players').find().toArray();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

// POST: Crear un jugador
app.post('/api/players', async (req, res) => {
  try {
    const player = req.body;
    const result = await db.collection('players').insertOne(player);
    res.status(201).json({ _id: result.insertedId, ...player });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear jugador' });
  }
});

module.exports = serverless(app);