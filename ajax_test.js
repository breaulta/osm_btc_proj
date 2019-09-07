const http = require('http');
const qs = require('querystring');

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
response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
            response.end('worked!');
        });

    } else {
//        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
 //       response.end();
    }

}).listen(8080);
