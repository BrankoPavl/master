const Kafka = require("kafkajs").Kafka 
async function run(topic_name){
  try{ // to create a topic, we need to create admin connection
     const kafka = new Kafka({
          "clientId": "myapp", 
          "brokers": ["localhost:9092"]
     })
     const admin = kafka.admin();
     console.log("Connecting...")
     await admin.connect()
     console.log("Connected!")

     let arrayOfTopics = await admin.listTopics()
     if( arrayOfTopics.includes(topic_name) ){
              await admin.disconnect();
              throw new Error('Topic you want to create already exist');
       } else {
          await admin.createTopics({ //creating a topic
              "topics": [{
                "topic": topic_name,    
                "numPartitions": 3,
                "replicationFactor": 1
              }]  
          })
       }

     console.log(`Topic ${topic_name} is successfully created!`)
     await admin.disconnect();
  }
  catch(ex){
      console.error("Error has occurred")
  }
}
const topics = ["temperature", "humidity", "pm2"];
for(let i=0; i< topics.length; i++){
run(topics[i]);
}
