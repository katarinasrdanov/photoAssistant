import grpc
import nightsky_pb2 as nightsky_pb2
import nightsky_pb2_grpc as nightsky_pb2_grpc

def grpc_client():
    channel = grpc.insecure_channel('localhost:50051') #kanal med clientom in streznikom
    stub = nightsky_pb2_grpc.NightSkyServiceStub(channel) #stub objekat koji omogućava klijentu da poziva gRPC metode definisane na serveru
    return stub

def get_visibility_stub(location):
    stub = grpc_client()#stub mi omogoci dostop do nightsky sevisa
    grpc_request = nightsky_pb2.VisibilityRequest( #zahteva grpc
        location=location
        )
    return stub.GetVisibility(grpc_request) #slanje severu zahteva sa lokacijom

def get_night_event_stub():
    stub = grpc_client()
    request = nightsky_pb2.NightEventRequest()
    return stub.GetNightEvent(request) 

def save_camera_stub(model, details):
    stub = grpc_client()
    grpc_request = nightsky_pb2.SaveCameraRequest(
        model=model, 
        details=details
    )
    return stub.SaveCamera(grpc_request)

def get_upcoming_night_sky_events_stub(period):
    stub = grpc_client()
    grpc_request = nightsky_pb2.UpcomingNightEventsRequest(
        period=period
        )
    return stub.GetUpcomingNightEventsStream(grpc_request)
