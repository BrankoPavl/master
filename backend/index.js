const express = require("express")
const { createPool } = require('mysql')
const cors = require("cors");
const app = express();

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
        currentMap.set(location, average);
    });
    return currentMap;
}

app.use(cors());
app.get("/data", (req, res) => {
    const pool = createPool({
        host: 'localhost',
        user: 'root',
        password: 'branko123',
        database: 'test',
        insecureAuth: true
    })

    let temperatureMap = new Map();
    const temperatureQuery = new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM newTestTable WHERE measure = 'temperature';`, (err,resultTemperature) => {
                if(err){
                    reject(err)
                } else {
                console.log('Data is taken from database!')
                temperatureMap = makeMap(resultTemperature)
                resolve(temperatureMap)
                }
            });
    });

    let pm2Map = new Map();
    const pm2Query = new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM newTestTable WHERE measure = 'pm2';`, (err,resultPm2) => {
                if(err){
                    reject(err)
                } else {
                console.log('Data is taken from database!')
                pm2Map = makeMap(resultPm2)
                resolve(pm2Map)
                }
            })
    });
    let humidityMap = new Map();
    const humidityQuery = new Promise((resolve, reject) => {
            pool.query(`SELECT * FROM newTestTable WHERE measure = 'humidity';`, (err,resultHumidity) => {
                if(err){
                    reject(err);
                } else {
                    console.log('Data is taken from database!');
                    humidityMap = makeMap(resultHumidity);
                    resolve(humidityMap); 
                }

            })
    });
    Promise.all([temperatureQuery, pm2Query, humidityQuery])
    .then(([temperatureMap, pm2Map, humidityMap]) => {
        const data = {
            pm2: Array.from(pm2Map.entries()).map(([location, value]) => ({ location, value })),
            humidity: Array.from(humidityMap.entries()).map(([location, value]) => ({ location, value })),
            temperature: Array.from(temperatureMap.entries()).map(([location, value]) => ({ location, value }))
        };
        res.json(data);
    })
    .catch((error) => {
      console.error('Error fetching data from the database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    })
    .finally(() => {
      pool.end(); // Close the database connection
    });

});
app.listen(3000, () => console.log("Server is listening to port 3000"));