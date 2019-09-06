var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.10.105",
  user: "test",
  password: "",
  port: "3306",
  database: "test_schema"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "ALTER TABLE venues ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY";
  con.query(sql , function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
