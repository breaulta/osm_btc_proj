//Load modules.
const http = require('http');
const qs = require('querystring');  //For parsing POST requests.
const fs = require('fs');                       //File system. Used for log files.
const mysql = require('mysql');
const sanitizeHtml = require('sanitize-html');  //Used to prevent cross site scripting.

//Connection object to mysql server. Query methods will use the 'con' object.
var con = mysql.createConnection({
        host: "localhost",
        user: "qrcofhgs_testuser",
        password: "neodriven",
        port: "3306",
        database: "qrcofhgs_testdb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ('hillsdale', 41.9, -84.6)";
  con.query(sql , function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
