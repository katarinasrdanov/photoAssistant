import grpc
import nightsky_pb2
import nightsky_pb2_grpc

# Kreiraj kanal i stub
channel = grpc.insecure_channel('localhost:50051')
stub = nightsky_pb2_grpc.NightSkyServiceStub(channel)

# Funkcija za pridobivanje svetlobnega onesnaženja
def get_light_pollution(location):
    request = nightsky_pb2.LightPollutionRequest(location=location)
    response = stub.GetLightPollution(request)
    print(f"Light Pollution Level in {location}: {response.level}")

# Funkcija za pridobivanje nočnih dogodkov
def get_night_event():
    request = nightsky_pb2.NightEventRequest()
    response = stub.GetNightEvent(request)
    print(f"Night Event: {response.title}")
    print(f"Event Details: {response.details}")

# Funkcija za real-time posodobitve
def get_real_time_updates(location):
    request = nightsky_pb2.StreamRequest(location=location)
    stream = stub.GetRealTimeUpdates(request)
    try:
        for update in stream:
            print(f"Real-time update: {update.data}")
    except grpc.RpcError as e:
        print(f"Stream ended with error: {e}")

# Klic funkcij za testiranje
if __name__ == "__main__":
    get_light_pollution("Maribor")
    get_night_event()
    get_real_time_updates("Celje")
