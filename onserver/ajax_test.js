const http = require('http');
const qs = require('querystring');
const fs = require('fs');

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
			var stream = fs.createWriteStream("test_log.txt");
				stream.once('open', function(fd) {
				stream.write("Data received from client:\n");
				stream.write(reply);
				stream.end();
			});
			//post.venue, post.latitude, post.longitude
			response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end(reply);
        });

    } else {
		//test printing a logfile
		var stream = fs.createWriteStream("test_log.txt");
			stream.once('open', function(fd) {
  			stream.write("non post request received!\n");
			stream.end();
		});

        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end('Non POST request received.');
    }

}).listen(12001);
