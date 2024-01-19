const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const server = new grpc.Server();

const PROTO_PATH = path.resolve(__dirname, '../services/healthChecker.proto');

const healthPackageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const healthPackage = grpc.loadPackageDefinition(healthPackageDefinition); //.healthChecker;
server.addService(healthPackage.HealthChecker.service, {
  "allSymptoms": allSymptoms,
  "createSymptom": createSymptom,
  "getDiagnosis": getDiagnosis,
  "deleteSymptom": deleteSymptom
});


server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
console.log("Started server at localhost:50051");

const allSymptoms = (call, callback) => {
  
}

const createSymptom = (call, callback) => {
  const symptom = call.request;
   // Save the new symptom to a database or file system
    callback(null, { id: '1234' });
}

const getDiagnosis = (call, callback) => {
    // Retrieve the diagnosis from a database or file system based on the symptom ID
    const id = call.request;
      if(id === '1234'){
        return callback(null, "Fever");
      } else
          throw new Error("Symptom not found")
}
const deleteSymptom = (call, callback) => {
    // Delete the symptom from a database or file system based on the ID
     const id = call.request;
       if(id === '1234'){
         return callback({}, null);
      } else
          throw new Error("Symptom not found")
};

function checkHealth(call, callback) {
  callback(null, { status: 'Healthy' });
}

function main() {
  const server = new grpc.Server();
  server.addService(healthCheckerProto.HealthChecker.service, { checkHealth });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
  console.log('Server running on port 50051');
}

main();