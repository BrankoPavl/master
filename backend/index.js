const express = require("express")
const { createPool } = require('mysql')
const cors = require("cors");
const app = express();

app.use(cors());
app.get("/data", (req, res) => {
    const pool = createPool({
        host: 'localhost',
        user: 'root',
        password: 'branko123',
        database: 'test',
        insecureAuth: true
    })

    function makeMap(queryFromDB){
        const currentMap = new Map();
        const listOfLocations = ["NoviBeograd", "Zemun", "Zvezdara", "Karaburma", "Autokomanda", "Vracar", "Palilula", "Ovca", "Dorcol"];
        listOfLocations.forEach((location) => {
            let sumValue = 0;
            let numberOfItems = 0;
            queryFromDB.forEach((currentResult) => {
                if ( currentResult.location == location ){
                    sumValue += currentResult.value;
                    numberOfItems +=1;
                }
            });
            let average = sumValue/numberOfItems;
            console.log(`for ${location}, average Temperature is ${average}`);
            currentMap.set(location, average);
        });
        return currentMap;
    }
    let temperatureMap = new Map();
    pool.query(`SELECT * FROM newTestTable WHERE measure = 'temperature';`, (err,resultTemperature, fields) => {
        if(err){
            return console.log(err)
        }
        console.log('Data is taken from database!')
        // const listOfLocations = ["NoviBeograd", "Zemun", "Zvezdara", "Karaburma", "Autokomanda", "Vracar", "Palilula", "Ovca", "Dorcol"];
        // listOfLocations.forEach((location) => {
        //     let sumValue = 0;
        //     let numberOfItems = 0;
        //     resultTemperature.forEach((currentResult) => {
        //         if ( currentResult.location == location ){
        //             sumValue += currentResult.value;
        //             numberOfItems +=1;
        //         }
        //     });
        //     let average = sumValue/numberOfItems;
        //     console.log(`for ${location}, average Temperature is ${average}`);
        //     temperatureMap.set(location, average);
        // });
        temperatureMap = makeMap(resultTemperature)
        temperatureMap.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });
    })

    let pm2Map = new Map();
    pool.query(`SELECT * FROM newTestTable WHERE measure = 'pm2';`, (err,resultPm2, fields) => {
        if(err){
            return console.log(err)
        }
        console.log('Data is taken from database!')
        // const listOfLocations = ["NoviBeograd", "Zemun", "Zvezdara", "Karaburma", "Autokomanda", "Vracar", "Palilula", "Ovca", "Dorcol"];
        // listOfLocations.forEach((location) => {
        //     let sumValue = 0;
        //     let numberOfItems = 0;
        //     resultPm2.forEach((currentResult) => {
        //         if ( currentResult.location == location ){
        //             sumValue += currentResult.value;
        //             numberOfItems +=1;
        //         }
        //     });
        //     let average = sumValue/numberOfItems;
        //     console.log(`for ${location}, average Pm2 is ${average}`);
        //     pm2Map.set(location, average);
        // });
        pm2Map = makeMap(resultPm2)
        pm2Map.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
    })

    let humidityMap = new Map();
    pool.query(`SELECT * FROM newTestTable WHERE measure = 'humidity';`, (err,resultHumidity, fields) => {
        if(err){
            return console.log(err)
        }
        console.log('Data is taken from database!')
        // const listOfLocations = ["NoviBeograd", "Zemun", "Zvezdara", "Karaburma", "Autokomanda", "Vracar", "Palilula", "Ovca", "Dorcol"];
        // listOfLocations.forEach((location) => {
        //     let sumValue = 0;
        //     let numberOfItems = 0;
        //     resultHumidity.forEach((currentResult) => {
        //         if ( currentResult.location == location ){
        //             sumValue += currentResult.value;
        //             numberOfItems +=1;
        //         }
        //     });
        //     let average = sumValue/numberOfItems;
        //     console.log(`for ${location}, average humidity is ${average}`);
        //     humidityMap.set(location, average);
        // });
        humidityMap = makeMap(resultHumidity)
        humidityMap.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });

        const data = {
            pm2: Array.from(pm2Map.entries()).map(([location, value]) => ({ location, value })),
            humidity: Array.from(humidityMap.entries()).map(([location, value]) => ({ location, value })),
            temperature:Array.from(temperatureMap.entries()).map(([location, value]) => ({ location, value }))
        };
        res.json(data);
    })
      
});
app.listen(3000, () => console.log("Server is listening to port 3000"));