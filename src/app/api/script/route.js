import mysql from 'mysql2/promise';
import {config, newdatabase} from '../db.js';

export async function GET(req) {
  console.log('first')
  const { searchParams } = new URL(req.url);
  const ScriptID = searchParams.get('ScriptID');
  const NewsId = searchParams.get('NewsId');
  let connection;
  try {
    connection = await mysql.createConnection(config);


    try {
       const query = newdatabase ? `SELECT Script FROM script WHERE ScriptID=?`: `SELECT Script FROM script WHERE ScriptID=? AND NewsId=?`;
      const [rows] = await connection.query(query, [ScriptID, NewsId]);
      return new Response(JSON.stringify({ data: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      if (connection) {
        await connection.end(); // Close the database connection
    }

    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
