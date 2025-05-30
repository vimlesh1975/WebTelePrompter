import mysql from 'mysql2/promise';
import {config, newdatabase} from '../db.js';

export async function GET(req) {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    const query = newdatabase ? `SELECT distinct bulletinname as title FROM bulletin where bulletinname != '' and  bulletintype ='News Bulletin' and status=1  order by bulletinname asc` : `SELECT distinct title FROM newsid where title != '' order by title asc`

    try {
      const [rows] = await connection.query(query);
      return new Response(JSON.stringify({ data: rows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      if (connection) {
        await connection.end(); // Close the database connection
      }
    }
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
