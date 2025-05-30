import mysql from 'mysql2/promise';
import { config } from '../db.js';
import socket from '../socketClient.js';

export async function POST(req) {
    const payload = await req.json();
    const { prompterId, curstory, curbulletin, ScriptID, usedStory, selectedDate } = payload;

    const emittedData = { prompterId, curstory, curbulletin, ScriptID, usedStory, bulletindate: selectedDate };
    socket.emit('currentStory1', emittedData);

    let connection;
    try {
        const query = `
            INSERT INTO currentstory (
                prompterId, curstory, curbulletin, ScriptID, usedStory, bulletindate
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                curstory = VALUES(curstory),
                curbulletin = VALUES(curbulletin),
                ScriptID = VALUES(ScriptID),
                usedStory = VALUES(usedStory),
                bulletindate = VALUES(bulletindate)
        `;

        const values = [
            prompterId,
            curstory,
            curbulletin,
            ScriptID,
            JSON.stringify(usedStory),
            selectedDate
        ];

        // console.log(values);

        connection = await mysql.createPool(config);

        try {
            await connection.query(query, values);
            return new Response(JSON.stringify({ message: 'Content inserted/updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
