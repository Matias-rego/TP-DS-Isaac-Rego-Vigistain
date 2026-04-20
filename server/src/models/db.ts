import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tomas010',
    database: 'taller_mecanico'
})   

export default connection;  
