  
// From https://stackabuse.com/how-to-start-a-node-server-examples-with-the-most-popular-frameworks/
// app.js

const http = require('http');
const mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "qrcofhgs_testuser",
  password: "neodriven",
  port: "3306",
  database: "qrcofhgs_testdb"
});

// Create an instance of the http server to handle HTTP requests
let app = http.createServer((req, res) => {

	var vresult;
	con.connect(function(err) {
      if (err) throw err;
    	var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ('hillsdale', 41.9, -84.6)";
  		con.query(sql , function (err, result) {
		vresult = result;
    	if (err) throw err;
    		console.log("Database created");
  		});
	});

	// Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'text/plain'});
    // Send back a response and end the connection
    res.end('This is the result:', vresult);
});

// Start the server on port 3000
app.listen(3000, '127.0.0.1');
console.log('Node server running on port 3000');
