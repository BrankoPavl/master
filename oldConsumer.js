const Kafka = require("kafkajs").Kafka
const argument = process.argv[2];
async function run(topicName){
  try{ 
        const kafka = new Kafka({                     
            "clientId": "myapp",
            "brokers": ["localhost:9092"] 
        });
        const consumer = kafka.consumer({groupId: "group222"});
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
            throw new Error(`Array of topics does not match existing topics`)
          }
        }
        console.log("Connecting...");
        await consumer.connect();
        console.log("Connected!!");
        topics.forEach(async topic => {
            await consumer.subscribe({
              topic,
              fromBeginning: true
            });
        });

        await consumer.run({
            "autoCommitInterval": 3000,
            "autoCommitThreshold": 10,
            "eachMessage": async result => {
              const message = result.message.value;
              const object = JSON.parse(message);
              console.log(`${object.location}`);
              console.log(`Message is received ${result.message.value} on partition ${result.partition}`)
            }
        })
  }
  catch(ex){
    console.error(`${ex}`);
  }
}
run(argument);

function checkMatchingArrays(array1, array2) {
  const str1 = array1.join(',');
  const str2 = array2.join(',');
  return array1.every(element => array2.includes(element));
}