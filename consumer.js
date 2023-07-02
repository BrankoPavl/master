const Kafka = require("kafkajs").Kafka
const mysql = require('mysql');
const argument = process.argv[2];

let connection;
async function run(topicName){
  try{ 
        const kafka = new Kafka({                     
            "clientId": "myapp",
            "brokers": ["localhost:9092"] 
        });
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'branko123',
            database: 'test',
            insecureAuth: true
          });
        const consumer = kafka.consumer({groupId: "group1"});
        const admin = kafka.admin();
        let arrayOfTopics = await admin.listTopics();
        const topics = topicName ? [topicName] : ["pm2", "humidity"];
        if (topicName){
            if(!arrayOfTopics.includes(topicName)){
              await admin.disconnect();
              throw new Error(`Topic does not exist`)
            }
        } else{
          if( !checkMatchingArrays(topics, arrayOfTopics) ){
            await admin.disconnect();
            throw new Error(`Provided topic don’t match any existing`)
          }
        }
        await consumer.connect();
        console.log("Connected to broker!!");
        topics.forEach(async topic => {
            await consumer.subscribe({
              topic,
              fromBeginning: true
            });
        });
        await connection.connect((err) => {
          if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
          }
          console.log('Connected to MySQL database!');
        });

        await consumer.run({
            "autoCommitInterval": 3000,
            "autoCommitThreshold": 10,
            "eachMessage": async result => {
                console.log(`Message is received ${result.message.value} on partition ${result.partition}`)
                const message = result.message.value;
                const object = JSON.parse(message);
                const values = [`${object.location}`, `${object.measure}`, `${object.value}`];
                connection.query('INSERT INTO kafkaTable (`location`, `measure`, `value`) VALUES (?, ?, ?)', values, (err, result) => {
                    if (err) {
                      console.error('Error inserting data:', err);
                      return;
                    }
                    console.log('Data inserted successfully!');
                });
            }
        })
  }
  catch(ex){ console.error(`${ex}`); }
}
process.on('exit', () => {
  if (connection) {
    connection.end((err) => {
      if (err) {
        console.error('Error closing connection:', err);
      } else {
        console.log('Connection to MySQL database closed!');
      }
    });
  }
});
run(argument);
function checkMatchingArrays(array1, array2) {
  const str1 = array1.join(',');
  const str2 = array2.join(',');
  return array1.every(element => array2.includes(element));
}