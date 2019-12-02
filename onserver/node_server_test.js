//Load modules.
const http = require('http');
const qs = require('querystring');  //For parsing POST requests.
const fs = require('fs');			//File system. Used for log files.
const mysql = require('mysql');

//Connection to mysql server.
var con = mysql.createConnection({
  host: "localhost",
  user: "qrcofhgs_testuser",
  password: "neodriven",
  port: "3306",
  database: "qrcofhgs_testdb"
});

function add_loc_to_sql(name, latitude, longitude, callback) {
	var reply = '';
    //var sql = "ALTER TABLE venues ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY";
	//Use placeholders (?) to prevent injection attack.
    var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ( ?, ?, ?)";
    con.query(sql, [name, latitude, longitude], function (err, result) {
    	if (err) {
			 callback(err.code);
		} else {
			reply += "Insert call completed. Rows affected:" + result.affectedRows;
			callback(reply);
		}
    });
}

//Properly uses callback to return the error value
function delete_loc_from_sql(name, callback) {
	var reply = '';
	  //Use placeholders (?) to prevent injection attack.
      var sql = "DELETE FROM venues WHERE name = ?";
      con.query(sql, [name], function (err, result) {
        if (err) {
			callback(err.code);
		} else {
			reply += "Delete call completed. Rows affected:" + result.affectedRows;
			callback(reply);
		}
      });
}


http.createServer(function(request, response) {
    if(request.method == 'POST') {
		var body = '';

		//When we have all of the data, run this function which stores the data into the variable 'body'.
        request.on('data', function (data) {
			//Take data received from POST request and store it in body.
            body += data;
        });

        request.on('end', function () {
			//Take the POST request data and put into object as key-value pairs.
            var post = qs.parse(body);
			if (post.action == 'add'){
				//using the node callback structure on function calls is a must.
				add_loc_to_sql(post.venue, post.latitude, post.longitude, function(result){
					response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                    response.end(result);
				});
			}else if (post.action == 'delete'){
				delete_loc_from_sql(post.venue, function(result){
					response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
					response.end(result);
				});
			}
        });
    } else {
		//test printing a logfile
		var stream = fs.createWriteStream("nonpost_log.txt");
			stream.once('open', function(fd) {
  			stream.write("non post request received!\n");
			stream.end();
		});

        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end('Non POST request received.');
    }

}).listen();
