const http = require('http');
const qs = require('querystring');
const fs = require('fs');
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


function send_to_sql(name, latitude, longitude) {
    con.connect(function(err) {
      if (err) throw err;
      //console.log("Connected!");
        var stream = fs.createWriteStream("conn_log.txt");
            stream.once('open', function(fd) {
            stream.write("Connected to sql.\n");
            stream.end();
        });
      //var sql = "ALTER TABLE venues ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY";
      var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ('"+name+"','" +latitude+"','"+longitude+"')";
      con.query(sql , function (err, result) {
        if (err) throw err;
        var success = "Successfully entered into MySQL";
        console.log(success);
        return result;
      });
    });
}

http.createServer(function(request, response) {
    if(request.method == 'POST') {
		var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
			reply = "Data Received! name:"+post.venue+" latitude:"+post.latitude+" longitude:"+post.longitude;
			var stream = fs.createWriteStream("rcvd_log.txt");
				stream.once('open', function(fd) {
				stream.write("Data received from client:\n");
				stream.write(reply);
				stream.end();
			});
//sql stuff
result = send_to_sql(post.venue, post.latitude, post.longitude);
			//post.venue, post.latitude, post.longitude
			response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end(reply);
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

}).listen(12001);
