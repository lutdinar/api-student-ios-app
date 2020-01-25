var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var md5 = require('md5');

/* Connection to database */
function getConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'db_ios_app'
  });

}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond users page with a resource');
});

router.post('/', function (req, res) {
  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var username = req.query.username;
  var password = req.query.password;
  var email = req.query.email;
  var role = req.query.role;

  var queryString = "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)";
  var connection = getConnection();

  connection.query(queryString, [username, md5(password), email, role], function (err, results, fields) {

    if (err) {
      res.json(msg);
    }

    if (results.affectedRows != 0) {
      console.log('Inserted a new user with id : ' + results.insertId);
      msg['status'] = 200;
      msg['message'] = 'Successfully created new user';
      msg['userId'] = results.insertId;
    } else {
      msg['status'] = 500;
      msg['message'] = 'Failed to inserted a new user';
      msg['userId'] = null;
    }

    res.json(msg);

  });
});

router.put('/', function (req, res) {

  console.log("Updating account user by id : " + req.query.id)

  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var userId = req.query.id;
  var username = req.query.username;
  var password = req.query.password;
  var email = req.query.email;
  var role = req.query.role;

  var queryString = "UPDATE users SET username = ?, password = ?, email = ?, role = ? WHERE id = ?";
  var connection = getConnection();

  if (!!userId && !!username && !!password && !!email && !!role) {

    connection.query(queryString, [username, md5(password), email, role, userId], function (err, results, fields) {
      if (err) {
        res.json(msg)
      }

      if (results.affectedRows != 0) {
        msg['status'] = 200;
        msg['message'] = 'Successfully updated user';
        msg['affectedRows'] = results.affectedRows;
        msg['item'] = results.message;
      } else {
        msg['status'] = 500;
        msg['message'] = 'Failed updated user';
        msg['affectedRows'] = results.affectedRows;
        msg['item'] = results.message;
      }

      res.json(msg);
    });

  } else {
    msg['status'] = 500;
    msg['message'] = 'Input berdasarkan i.e';
    res.json(msg);
  }

});

router.put('/reset-password.json', function (req, res) {

  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var id = req.query.id,
      password = req.query.password;

  var queryString = "UPDATE users SET password = ? WHERE id = ?";
  var connection = getConnection();

  connection.query(queryString, [md5(password), id], function (err, results) {

    if (err) {
      res.json(msg);
    }

    if (results.affectedRows != 0) {
      msg['status'] = 200;
      msg['message'] = 'Successfully updated user';
      msg['affectedRows'] = results.affectedRows;
      msg['item'] = results.message;
    } else {
      msg['status'] = 500;
      msg['message'] = 'Failed updated user';
      msg['affectedRows'] = results.affectedRows;
      msg['item'] = results.message;
    }

    res.json(msg);

  })

});

router.get('/all.json', function (req, res) {
  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var queryString = "SELECT username, password, email, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at FROM users";
  var connection = getConnection();

  connection.query(queryString, function (err, rows, fields) {
    if (err) {
      res.json(msg);
    }

    msg['status'] = 200;
    msg['message'] = "Successfully fetch all data users";
    msg['affectedRows'] = rows.length;

    for (var i = 0; i < rows.length; i++) {
      var dao = rows[i];
      dao.password = 'SECRET';
    }

    msg['items'] = rows;

    res.json(msg);
  })
});

router.get('/findById.json', function (req, res) {
  console.log("Fetching users by id : " + req.query.id)

  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var userId = req.query.id;
  var connection = getConnection();
  var queryString = "SELECT id, username, password, email, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at FROM users WHERE id = ? ORDER BY id ASC";

  connection.query(queryString, [userId], function (err, rows, fields) {

    if (err) {
      res.json(msg)
    }

    msg['status'] = 200;
    msg['message'] = 'Succesfully fetch data user by id';
    msg['affectedRows'] = rows.length;

    rows[0].password = 'SECRET';
    msg['item'] = rows[0];

    res.json(msg);

  });
});

router.post('/auth.json', function (req, res) {

  var msg = {
    'status': 500,
    'message': 'Internal server error'
  };

  var username = req.query.username,
      password = req.query.password;

  var queryString = "SELECT username, password, email, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at FROM users WHERE username = ? AND password = ?";
  var connection = getConnection();

  connection.query(queryString, [username, md5(password)], function (err, rows) {

    if (err) {
      res.json(msg);
    }

    msg['status'] = 200;
    msg['message'] = 'Successfully get data user by username and password';
    msg['affectedRows'] = rows.length;

    for (var i = 0; i < rows.length; i++) {
      rows[i].password = 'SECRET'
    }

    msg['item'] = rows[0];

    res.json(msg);

  });
});



module.exports = router;
