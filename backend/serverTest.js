const { createPool } = require('mysql')

const pool = createPool({
        host: 'localhost',
        user: 'root',
        password: 'branko123',
        database: 'test',
        insecureAuth: true
})

pool.query(`select * from newTestTable`, (err,result, fields) => {
    if(err){
        return console.log(err)
    }
    return console.log(result);
})