require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const mysql = require("msql2/promise");

app.use(express.json());
app.use(cookieParser());
app.use(cors({

origin: process.env.FRONTEND_ORIGIN,
credentials: true

}
)); 

const pool = mysql.createPool({

    host: process.env.DB_HOST, 
    port: process.env.DB_PORT, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    coretech_db: process.env.DB_NOMBRE,
    waitForConnections: true, 
    connectionLimit: 10,

}); 

const COOKIE_NAME = "sid"; 
const session = {}; 

function autentificacionMiddleware(req, res, next){
    const sind = req.cookies[COOKIE_NAME]; 

    if (!sid || !session[sid]){
        return res.status(401).json({error: "No autentificado"});
    }

    if(Data.now() > sessions[sid].expiresAt){
        delete sessions[sid];
        return res.status(401).json({error: "Sesion expirada"});
    }

    req.userId = sessions[sid].id_usuario; 
    next();
}

app.get("/api/funcionamiento", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS ok");
        res.json(rows[0]);
    }

    catch (err) {
        res.status(500).json({error: "Error de conexion DB"});
    }

}); 




