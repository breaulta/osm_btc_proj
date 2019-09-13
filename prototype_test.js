const http = require('http');
const qs = require('querystring');
const mysql = require('mysql');

//Connection to mysql server.
//Mysql code taken from https://stackoverflow.com/a/53919762
var con = mysql.createConnection({
  host: "192.168.10.105",
  user: "test",
  password: "test",
  port: "3306",
  database: "test_schema"
});

function send_to_sql(name, latitude, longitude) {
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	  //var sql = "ALTER TABLE venues ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY";
	  var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ('"+name+"','" +latitude+"','"+longitude+"')";
	  con.query(sql , function (err, result) {
		if (err) throw err;
		var success = "Successfully entered into MySQL";
		console.log(success);
		return success;
	  });
	});
}
//server stuff - taken from https://stackoverflow.com/a/4310087
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
            // use post['blah'], etc.
            console.log(post);
			result = send_to_sql(post.venue, post.latitude, post.longitude);
console.log(result);
response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end(result);
        });
  
    } else {
//        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
 //       response.end();
    }

}).listen(8080);
