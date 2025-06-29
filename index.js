require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const app = express();

app.use(cors());
app.use(express.json());

// ✅ SQL Server connection settings
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

//Middleware to check API Key
app.use((req, res, next) => {
    const requestKey = req.headers['x-api-key'];
    const validKey = process.env.API_KEY;

    if (requestKey !== validKey) {
        return res.status(403).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
});

// ✅ POST endpoint
app.post('/api/create-user', async (req, res) => {
    console.log('Received body:', req.body);
    const {
        ID, FirstName, LastName, Social, PassportNo, DOB, Sex, PopulationGroup
    } = req.body;

    try {
        // ❌ FIXED: 'config' was not defined — use 'dbConfig'
        await sql.connect(dbConfig);

        const request = new sql.Request();
        // ❌ FIXED: variable names must match case — they are 'FirstName', not 'firstName'
        request.input('ID', sql.BigInt, ID);
        request.input('FirstName', sql.NVarChar(64), FirstName);
        request.input('LastName', sql.NVarChar(64), LastName);
        request.input('Social', sql.VarChar(13), Social);
        request.input('PassportNo', sql.NVarChar(64), PassportNo || null);
        request.input('DOB', sql.Date, DOB || null);
        request.input('Sex', sql.BigInt, Sex || null);
        request.input('PopulationGroup', sql.BigInt, PopulationGroup);

        await request.execute('CreateUserProfile');

        res.status(200).json({ message: '✅ User profile created successfully.' });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('API is running');
});


// ✅ Start the server (this is what you're asking about)
app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 API server running on port ${process.env.PORT || 5000}`);
});
