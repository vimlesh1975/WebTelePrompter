import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export async function GET(req) {
    try {
        const DB_NAME = process.env.DB_NAME;
        const DB_HOST = process.env.DB_HOST;
        const CASPAR_HOST = process.env.CASPAR_HOST;
        return new Response(JSON.stringify({ DB_NAME , DB_HOST, CASPAR_HOST}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { DB_NAME, DB_HOST , CASPAR_HOST} = body;
        console.log(body)

        const envFilePath = path.resolve(process.cwd(), '.env.local');

        // Read the existing content of the .env.local file
        let envContent = fs.existsSync(envFilePath)
            ? fs.readFileSync(envFilePath, 'utf-8')
            : '';

        // Split the content into lines and update DB_NAME and DB_HOST
        let lines = envContent.split('\n');
        let dbNameUpdated = false;
        let dbHostUpdated = false;
        let casparHostUpdated = false;

        lines = lines.map(line => {
            if (line.startsWith('DB_NAME=')) {
                dbNameUpdated = true;
                return `DB_NAME=${DB_NAME}`;
            }
            if (line.startsWith('DB_HOST=')) {
                dbHostUpdated = true;
                return `DB_HOST=${DB_HOST}`;
            }
            if (line.startsWith('CASPAR_HOST=')) {
                casparHostUpdated = true;
                return `CASPAR_HOST=${CASPAR_HOST}`;
            }
            return line;
        });

        // If DB_NAME wasn't found, add it to the end of the file
        if (!dbNameUpdated) {
            lines.push(`DB_NAME=${DB_NAME}`);
        }

        // If DB_HOST wasn't found, add it to the end of the file
        if (!dbHostUpdated) {
            lines.push(`DB_HOST=${DB_HOST}`);
        }
        if (!casparHostUpdated) {
            lines.push(`CASPAR_HOST=${CASPAR_HOST}`);
        }
        // Join the lines back into a string
        envContent = lines.join('\n');

        // Write the updated content back to the .env.local file
        fs.writeFileSync(envFilePath, envContent, 'utf-8');

        return new Response(JSON.stringify({ message: 'DB_NAME , DB_HOST and CASPAR_HOST updated in .env.local file' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

