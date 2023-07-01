const Kafka = require("kafkajs").Kafka
async function run(msg_data, topic_name){
  try{ 
        const kafka = new Kafka({                     
            "clientId": "myapp",
            "brokers": ["localhost:9092"] 
        });
        const producer = kafka.producer({
          allowAutoTopicCreation: false
        });
        console.log("Connecting...");
        await producer.connect();
        console.log("Connected!!");

        var object = JSON.parse(msg_data); //convert from string to json

        const result = await producer.send({
            "topic": topic_name,
            "messages": [
                {
                    "key": `${object.location}/${topic_name}`,
                    "value": msg_data 
                }
            ]
        });
        console.log(`Message sent to partition ${result[0].partition}, with partition key=${object.location}/${result[0].topicName} and value=${msg_data} and offset ${result[0].baseOffset}`);
        await producer.disconnect();

  }
  catch(ex){
    console.error("Error has occurred");
  }

}
const arrayOfMeasurements = ["temperature", "humidity", "pm2"];
const arrayOfLocations = ["NoviBeograd", "Zemun", "Zvezdara", "Karaburma", "Autokomanda", "Vracar", "Palilula", "Ovca", "Karaburma", "Dorcol"];
const arrayOfTemperatures = ["10", "15", "20", "25", "30"];
const arrayOfHumidities = ["40","65","80"];
const arrayOfPm2 = [25, 75, 100, 125];
for(let index=0; index < 5; index++){ // will send 5 messages to kafka
    const indexOfLocation = Math.floor(Math.random() * arrayOfLocations.length);
    //determine what measurement will be sent 
    const indexOfMeasure = Math.floor(Math.random() * arrayOfMeasurements.length);
    let value = "";
    switch(arrayOfMeasurements[indexOfMeasure]){
      case 'temperature':
        const temperatureIndex = Math.floor(Math.random() * arrayOfTemperatures.length);
        value = arrayOfTemperatures[temperatureIndex];
        break;
      case 'humidity':
        const humidityIndex = Math.floor(Math.random() * arrayOfHumidities.length);
        value = arrayOfHumidities[humidityIndex];
        break;
      case 'pm2':    
      const pm2Index = Math.floor(Math.random() * arrayOfPm2.length);
        value = arrayOfPm2[pm2Index];
        break;
      default:
        console.log("Unknown measurement");
    };

    const singleMessage = `{
      "location": "${arrayOfLocations[indexOfLocation]}",
      "measure": "${arrayOfMeasurements[indexOfMeasure]}",
      "value": ${value}
    }`;
    run(singleMessage, arrayOfMeasurements[indexOfMeasure]);
}
