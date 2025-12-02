const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './nightsky.proto';

// Naloži gRPC definicijo iz .proto datoteke
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const nightskyProto = grpc.loadPackageDefinition(packageDefinition).NightSkyService;

// Ustvari klienta
const client = new nightskyProto('localhost:50051', grpc.credentials.createInsecure());

// Funkcija za pridobitev svetlobnega onesnaženja
function getLightPollution(location) {
    client.GetLightPollution({ location }, (err, response) => {
        if (err) {
            console.error("Error fetching light pollution data:", err);
        } else {
            console.log("Light Pollution Level:", response.level);
        }
    });
}

// Funkcija za pridobitev nočnih dogodkov
function getNightEvent() {
    client.GetNightEvent({}, (err, response) => {
        if (err) {
            console.error("Error fetching night event data:", err);
        } else {
            console.log("Night Event:", response.title);
            console.log("Event Details:", response.details);
        }
    });
}


// Funkcija za real-time posodobitve
function getRealTimeUpdates(location) {
    const stream = client.GetRealTimeUpdates({ location });
    stream.on('data', (data) => {
        console.log("Real-time data:", data.data);
    });
    stream.on('end', () => {
        console.log("Stream ended.");
    });
}

// Klic funkcij za testiranje
getLightPollution("Maribor");
getNightEvent();
getRealTimeUpdates("Celje");
