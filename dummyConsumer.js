const { Kafka } = require("kafkajs");

async function run(topic) {
  try {
    const kafka = new Kafka({
      clientId: "myapp",
      brokers: ["localhost:9092"]
    });

    const consumer = kafka.consumer({ groupId: "group1" });

    console.log("Connecting...");
    await consumer.connect();
    console.log("Connected!!");

    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message on topic "${topic}", partition ${partition}: ${message.value}`);
      }
    });
  } catch (ex) {
    console.error(ex);
  }
}

// Retrieve the topic from command line argument
const topic = process.argv[2];
run(topic);
