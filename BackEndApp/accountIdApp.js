const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://smoop:c30MNpjC4hCu1Gj0@clustername-uocwt.mongodb.net";

const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

var location = [
    ["IRON", "I", "II", "III", "IV"],
    ["BRONZE", "I", "II", "III", "IV"],
    ["SILVER", "I", "II", "III", "IV"],
    ["GOLD", "I", "II", "III", "IV"],
    ["PLATINUM", "I", "II", "III", "IV"],
    ["DIAMOND", "I", "II", "III", "IV"],
    ["MASTER", "I"],  
    ["GRANDMASERT", "I"],
    ["CHALLENGER", "I"],
    ["FIN"]
];

/*var location = [
    ["baseTest1", "I", "II"],
    ["baseTest2", "I", "II"],
    ["FIN"]
];*/

function getSumId(a, b){
    const collection = client.db(location[a][0]).collection(location[a][b]);

    collection.find().toArray( (error, documents) => {
        if(error){
            throw error;   
        }
        console.log('Array built successfuly');

        var bar = new Promise((resolve, reject) => { 
            documents.forEach( (elem,index, array) => {
                setTimeout(function () {
                    console.log(index + ' -> ' + elem.name);
                    getApiAccId(elem.summonerId, elem.name, elem.ligue, a, b);
                    if (index === array.length -1) resolve();
                }, index * 1200 );
            });
        });

        bar.then(() => {
            if (location[a][b+1] === undefined){
                b = 0;
                a++;
            }
            if (location[a][0] !== "FIN"){
                getSumId(a, b+1);   
            } else {
                console.log('FINI');
            }
        });

    });  
}


function getApiAccId(sumId, sumName, sumLigue, a, b){
    const request = require('request');
    var options = {
        method: 'GET',
        url: 'https://euw1.api.riotgames.com/lol/summoner/v4/summoners/'+sumId,
        qs: {api_key: 'RGAPI-7716bbe8-4a9b-4308-b5b5-15de08b5cf5e'}
    };
    
    request(options, (err, response, body) => {
        if (err) {
            console.log('Sorry unable to execute request. Error:', err);
        } else {
            var bodyJson = JSON.parse(body);
            
            var accData = {
                "nameMdb": sumName,
                "name": bodyJson.name,
                "ligue": sumLigue,
                "summonerId": sumId,
                "accountId": bodyJson.accountId
            }
            pushAccId(accData, a, b);
        }
    });
}

function pushAccId(data, a, b) {
    
    const collection = client.db("USERS").collection(location[a][0]); 

    collection.insertOne(data, (err, res) => {
        if(err){
            throw err;
        } 
        console.log(data.name + ' -> push in USERS : ' + location[a][0]);
    });
    
}



//START CLIENT
client.connect(err => {
    if (err) {
        console.log('Sorry unable to connect to MongoDB Error:', err);
    } else {
        console.log('Connected successfully to server', uri);
        
        getSumId(0, 1);

    }
});
