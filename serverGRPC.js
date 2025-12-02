const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './nightsky.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const nightskyProto = grpc.loadPackageDefinition(packageDefinition).NightSkyService; //učitava .proto fajl in servis nightskuservice 

const axios = require('axios'); //knjiznica za lazje slanje http zahtev s klienta

async function getVisibility(location) {
    const apiKey = '0c367ceb2011d2b0972b7889fc34a483';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    try {
        const response = await axios.get(url);
        const visibility = response.data.visibility;
        const visibility_values = visibility > 20000 ? 'High' : visibility > 10000 ? 'Moderate' : 'Low';

        return visibility_values;
    } catch (error) {
        console.error("Error fetching visibility data:", error);
        return 'Unknown';
    }
}

async function GetVisibility(call, callback) {
    const location = call.request.location; //call.request vsebuje pod ki je klient poslao strezniku
    const visibility = await getVisibility(location);

    callback(null, { level: visibility });
}

async function getNightEvent() {
    const apiKey = 'sPyrjdee308DuHICaXGa2CkgM3xZTUwvBhqhGaJg';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const eventTitle = response.data.title;
        const eventDetails = response.data.explanation;

        return { eventTitle, eventDetails };
    } catch (error) {
        console.error("Error fetching night event data:", error);
        return { eventTitle: 'Unknown Event', eventDetails: 'No details available.' };
    }
}

async function GetNightEvent(call, callback) {
    const event = await getNightEvent();
    callback(null, { title: event.eventTitle, details: event.eventDetails });
}


let savedCamera = null;

function SaveCamera(call, callback) {
    const { model, details } = call.request;
    savedCamera = { model, details };
    callback(null, { model, details });
}

const nightSkyEvents = [
    { date: "January 16", event: "Meteor Shower: Quadrantids" },
    { date: "January 18", event: "Lunar Eclipse" },
    { date: "January 21", event: "Jupiter visible in the night sky" },
    { date: "January 26", event: "Milky Way visible in the southern hemisphere" },
];

function getUpcomingNightEventsStream(call) {
    const period = call.request.period;

    let count = 0;
    const interval = setInterval(() => {
        if (count < nightSkyEvents.length) {
            call.write(nightSkyEvents[count]);  //slanje podatkov dokler ne poslje sve iz seznama
            count++;
        } else {
            clearInterval(interval);
            call.end();
        }
    }, 1000);  //posilja na eno sekundo
}

function getServer() {
    const server = new grpc.Server();
    server.addService(nightskyProto.service, {
        GetVisibility: GetVisibility,
        GetNightEvent: GetNightEvent,
        getUpcomingNightEventsStream: getUpcomingNightEventsStream,
        SaveCamera: SaveCamera
    });
    return server;
}

const server = getServer();
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server is running on port 50051');
    server.start();
});
