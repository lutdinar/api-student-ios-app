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

/* Initialize query for connection database */
var connection = getConnection();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/', function(req, res) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var name = req.query.name,
        nrp = req.query.nrp,
        email = req.query.email,
        major = req.query.major,
        phoneNumber = req.query.phoneNumber,
        address = req.query.address,
        usersId = req.query.usersId;

    var queryString = "INSERT INTO students (name, nrp, email, major, phone_number, address, users_id) VALUES (?, ?, ?, ?, ?, ?, ?)";

    connection.query(queryString, [name, nrp, email, major, phoneNumber, address, usersId], function (err, results) {
        if (err) {
            res.json(msg);
        }

        if (results.affectedRows != 0) {
            console.log('Inserted a new student with id : ' + results.insertId);
            msg['status'] = 200;
            msg['message'] = 'Successfully created new student';
            msg['userId'] = results.insertId;
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed to inserted a new student';
            msg['userId'] = null;
        }

        res.json(msg);
    })
});

router.put('/', function(req, res) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var id = req.query.id,
        name = req.query.name,
        nrp = req.query.nrp,
        email = req.query.email,
        major = req.query.major,
        phoneNumber = req.query.phoneNumber,
        address = req.query.address;

    var queryString = "UPDATE students SET name = ?, nrp = ?, email = ?, major = ?, phone_number = ?, address = ?, updated_at = current_timestamp WHERE id = ?";

    connection.query(queryString, [name, nrp, email, major, phoneNumber, address, id], function (err, results) {
        if (err) {
            res.json(msg);
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully updated student';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed updated student';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;
        }

        res.json(msg);
    })
});

router.delete('/', function(req, res) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var id = req.query.id;
    var queryString = "UPDATE students SET deleted_at = current_timestamp WHERE id = ?";

    connection.query(queryString, [id], function (err, results) {

        if (err) {
            res.json(msg);
        }

        if (results.affectedRows != 0) {
            msg['status'] = 200;
            msg['message'] = 'Successfully deleted student';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;
        } else {
            msg['status'] = 500;
            msg['message'] = 'Failed deleted student';
            msg['affectedRows'] = results.affectedRows;
            msg['item'] = results.message;
        }

        res.json(msg);

    })

});

router.get('/all.json', function(req, res) {

    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var queryString = "SELECT students.id, name, nrp, students.email, major, phone_number, address, DATE_FORMAT(students.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(students.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(students.deleted_at, '%d-%m-%Y %T') as deleted_at, users.id as users_id, users.username as users_username FROM students JOIN users ON students.users_id = users.id WHERE students.deleted_at is null";

    connection.query(queryString, function (err, rows) {

        if (err) {
            res.json(msg);
            console.log(err);
        }

        msg['status'] = 200;
        msg['message'] = 'Successfully fetch all data students';
        msg['affectedRows'] = rows.length;
        msg['items'] = rows;

        res.json(msg);

    });

});

router.get('/findById.json', function(req, res, next) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var id = req.query.id;

    var queryString = "SELECT id, name, nrp, email, major, phone_number, address, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at, users_id FROM students WHERE id = ?";

    connection.query(queryString, [id], function (err, rows) {

        if (err) {
            res.json(msg);
        }

        if (rows.length != 0) {
            getUserById(rows[0].users_id, rows[0], res);
        } else {
            msg['status'] = 200;
            msg['message'] = 'Successfully fetch all data students';
            msg['affectedRows'] = rows.length;

            res.json(msg);
        }

    });
});

function getUserById(userId, students, res) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var queryString = "SELECT username, password, email, role, DATE_FORMAT(created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(updated_at, '%d-%m-%Y %T') as updated_at FROM users WHERE id = ?";
    connection.query(queryString, [userId], function (err, rows) {

        if (err) {
            res.json(msg);
        }

        students.users = {
            'id': rows[0].id,
            'username': rows[0].username,
            'password': 'SECRET',
            'email': rows[0].email,
            'role': rows[0].role,
            'created_at': rows[0].created_at,
            'updated_at': rows[0].updated_at
        };

        students = {
            'id': students.id,
            'name': students.name,
            'nrp': students.nrp,
            'email': students.email,
            'major': students.major,
            'phone_number': students.phone_number,
            'address': students.address,
            'users': students.users,
            'created_at': students.created_at,
            'updated_at': students.updated_at
        };

        var msg = {
            'status': 200,
            'message': 'Successfully fetch data student by id',
            'item': students
        };

        res.json(msg);
    });

}

router.get('/findByUsersId.json', function(req, res) {
    var msg = {
        'status': 500,
        'message': 'Internal Server Error'
    };

    var usersId = req.query.usersId;

    var queryString = "SELECT students.id, name, nrp, students.email, major, phone_number, address, DATE_FORMAT(students.created_at, '%d-%m-%Y %T') as created_at, DATE_FORMAT(students.updated_at, '%d-%m-%Y %T') as updated_at, DATE_FORMAT(students.deleted_at, '%d-%m-%Y %T') as deleted_at, users.id as users_id, users.username as users_username FROM students JOIN users ON users.id = students.users_id WHERE students.users_id = ? AND students.deleted_at is null";

    connection.query(queryString, [usersId], function (err, rows) {
        if (err) {
            console.log(err);
            res.json(msg);
        }

        msg['status'] = 200;
        msg['message'] = 'Successfully fetch data students by users_id';
        msg['affectedRows'] = rows.length;
        msg['items'] = rows;

        res.json(msg);
    })
});

module.exports = router;
