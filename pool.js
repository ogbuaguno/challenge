const mysql = require('promise-mysql')

/**
 * object specifying the connection parameters
 */
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'Password12',
    database : 'challenge',
    connectionLimit : 10,
    multipleStatements : true,
    port : 3306
})

module.exports = pool