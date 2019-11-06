//Load modules.
const http = require('http');
const qs = require('querystring');  //For parsing POST requests.
const fs = require('fs');			//File system. Used for log files.
const mysql = require('mysql');

//Connection to mysql server.
//Mysql code taken from https://stackoverflow.com/a/53919762
var con = mysql.createConnection({
  host: "localhost",
  user: "qrcofhgs_testuser",
  password: "neodriven",
  port: "3306",
  database: "qrcofhgs_testdb"
});

function add_loc_to_sql(name, latitude, longitude) {
    con.connect(function(err) {
      if (err) throw err;
      //console.log("Connected!");
        var stream = fs.createWriteStream("conn_log.txt");
            stream.once('open', function(fd) {
            stream.write("Connected to sql.\n");
            stream.end();
        });
      //var sql = "ALTER TABLE venues ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY";
	  //Use placeholders (?) to prevent injection attack.
      var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ( ?, ?, ?)";
      con.query(sql, [name, latitude, longitude], function (err, result) {
        if (err) throw err;
        var success = "Successfully entered into MySQL";
        console.log(success);
        return result;
      });
    });
}

function delete_loc_from_sql(name) {
    con.connect(function(err) {
      if (err) throw err;
	  //Use placeholders (?) to prevent injection attack.
      var sql = "DELETE FROM venues WHERE name=(name) VALUES (?)";
      con.query(sql, [name], function (err, result) {
        if (err) throw err;
        return result;
      });
    });
}


http.createServer(function(request, response) {
    if(request.method == 'POST') {
		var body = '';

		//When we have all of the data, run this function which stores the data into the variable 'body'.
        request.on('data', function (data) {
			//Take data received from POST request and store it in body.
            body += data;
			// The below code doesn't work because we're checking a string lenght, not the header variable.
            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            //if (body.length > 1e6)
              //  request.connection.destroy();
        });

        request.on('end', function () {
			//Take the POST request data and put into object as key-value pairs.
            var post = qs.parse(body);
			if (post.action == 'add'){
				reply = "Add command received! name:"+post.venue+" latitude:"+post.latitude+" longitude:"+post.longitude;
				var stream = fs.createWriteStream("rcvd_log.txt");
					stream.once('open', function(fd) {
					stream.write("Data received from client:\n");
					stream.write(reply);
					stream.end();
				});
				//sql stuff
				result = add_loc_to_sql(post.venue, post.latitude, post.longitude);
				//post.venue, post.latitude, post.longitude
				response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
				response.end(reply);
			}else if (post.action == 'delete'){
				reply = "Delete command received! name:"+post.venue;
				result = delete_loc_from_sql(post.venue);	
				response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
				response.end(reply);
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
