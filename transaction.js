const mysql = require('mysql');

const connection = mysql.createConnection({
    "host": process.env.DB_HOST,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "supportBigNumbers": true,
    "bigNumberStrings": true
});

connection.connect(err => {
    if (err)
        throw new Error('GG connection');

    console.log('I am connected!');
});

// Do transaction. (later)
/*connection.beginTransaction(() => {

});*/

// Do transaction in sequence then release.
var query1 = `
    INSERT INTO user_activity_entity (\`name\`) 
    VALUES
      ('one') 
`;

var query2 = `
    INSERT INTO user_activity_entity (\`name\`) 
    VALUES
      ('plus') 
`;



console.log(connection);