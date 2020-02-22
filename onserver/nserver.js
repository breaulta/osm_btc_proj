//Load modules.
const http = require('http');
const qs = require('querystring');  //For parsing POST requests.
const fs = require('fs');			//File system. Used for log files.
const mysql = require('mysql');
const sanitizeHtml = require('sanitize-html');	//Used to prevent cross site scripting.

//Connection object to mysql server. Query methods will use the 'con' object.
var con = mysql.createConnection({
	host: "localhost",
	user: "qrcofhgs_testuser",
	password: "neodriven",
	port: "3306",
	database: "qrcofhgs_testdb"
});

//In node a callback function is needed due to asynchronicity.
function add_loc_to_sql(name, latitude, longitude, callback) {
	var reply = '';  //Set up reply string.
	//Use placeholders (?) to prevent injection attack.
	var sql = "INSERT INTO venues ( name, latitude, longitude ) VALUES ( ?, ?, ?)";
	//Query the database using the connection object.
	con.query(sql, [name, latitude, longitude], function (err, result) {
		//This portion runs after the query completes and returns to handle the callback of the query.
    	if (err) {
			//On an error, send the code to the client for debugging/error handling.
			//This callback corresponds to the add_loc_to_sql function.
			callback(err.code);
		} else {
			//As far as I can tell, using the affectedRows field in the returned result object is the best way to 
			//check if a query has completed successfully. On zero rows affected, there is usually a problem.
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

function load_table_from_sql(callback){
	var reply = '';
	var sql = "SELECT name, latitude, longitude FROM venues";
	con.query( sql, function (err, results, fields) {
		var stream = fs.createWriteStream("LOAD_TABLE_TEST.txt");
		stream.once('open', function(fd) {
			if (err) {
				stream.write("Error:\n");
				stream.write(JSON.stringify(err));
				stream.end();
			} else {
				stream.write("\nResults:\n");
				stream.write(JSON.stringify(results));
				stream.write("\nFields:\n");
				stream.write(JSON.stringify(fields));
				stream.end();
				callback(JSON.stringify(results));
			}
		});
	});
}

http.createServer(function(request, response) {
	//Handle POST request from client.
    if(request.method == 'POST') {
	    console.log("New request received!");
		var body = '';
		var clean_venue, clean_lat, clean_long;
		//When we have all of the data, run this function which stores the data into the variable 'body'.
        request.on('data', function (data) {
			//Take data received from POST request and store it in body.
            body += data;
			//I've re-added this code because unless we're using middleware DOS protection, we're vulnerable.
			//This is the quick and easy solution that should mostly work/help.
			//See https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js for more information.
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) { 
				// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
				request.connection.destroy();
            }
        });
        request.on('end', function () {	//We have received everything from the POST request.
			//Take the POST request data and put into object as key-value pairs.
			var clean_body = sanitizeHtml(body);
            var post = qs.parse(clean_body);

var stream = fs.createWriteStream("payload_body.txt");
stream.once('open', function(fd) {
	stream.write('      body=');
	stream.write(body);
	stream.write('\n');
	stream.write('clean_body=');
	stream.write(clean_body);
	stream.write('\n');

	stream.end();
});
			//Sanitize user inputs to prevent cross site scripting.
		/*	if(post.venue){ clean_venue = sanitizeHtml(post.venue); }
			if(post.latitude){ clean_lat= sanitizeHtml(post.latitude); }
			if(post.longitude){ clean_long= sanitizeHtml(post.longitude); } */
			if(post.action == 'add'){	//I chose to use 'add' to denote when to make an insertion query.
				//Using the node callback structure on function calls is a must in node.
				add_loc_to_sql(post.venue, post.latitude, post.longitude, function(result){
					//This code will execute once the query has completed and the callback has returned with the 'result' string.
					response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                    response.end(result);
				});
			}else if(post.action == 'delete') { //I chose to use 'delete' to denote when to make a delete query.
				delete_loc_from_sql(post.venue, function(result){
					//This code will execute once the query has completed and the callback has returned with the 'result' string.
					response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
					response.end(result);
				});
			}else if(post.action == 'load') { 
				load_table_from_sql( function(result){
					response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
					response.end('load' + result);
				});
			}
        });
    } else { //A non-POST request has been made to the server.
		//This method of printing logfiles is the only way I've got to work on the namecheap server.
		var stream = fs.createWriteStream("nonpost_log.txt");
			stream.once('open', function(fd) {
  			stream.write("non-POST request received!\n");
			stream.end();
		});
console.log("non post request received.");
        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end('non-POST request received.');
    }

}).listen(0.0.0.0:8080);

