const mysql = require("mysql");

var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Top#497681',
    database: 'vacCenter'
});

module.exports = connection;