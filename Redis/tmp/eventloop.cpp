// Online C++ compiler to run C++ program online
#include <iostream>
#include <string>
#include <vector>
#include <cstdint>
#include <thread>
#include <chrono>
#include <map>
#include "socket.cpp"

using namespace std;

typedef void(*func_event_ptr)(void);

class DataStore{
  private:
    std::map<string,string> keyValueStore;
  
  public:
    DataStore(){};
    
    void addKeyValue(string key, string value){
        this->keyValueStore[key] = value;
    }
    string getValue(string key){
        return this->keyValueStore[key];
    }
};

class ExtendedDataStore: public DataStore{
  public:
    ExtendedDataStore(){};
    
    Output executeCommand(string command, string key, string value){
        Output o1;
        if(command == "SET"){
            this->addKeyValue(key, value);
            o1.message = "SUCCESS";
        }else if(command == "GET"){
            string output = this->getValue(key);
            o1.message = "SUCCESS";
            o1.output = output;
        }else{
            // throw Error 
        }
        return o1;
    }
};

typedef Output(*event_executor)(DataStore* store, string command, string key, string value);

typedef void(*send_response)(Output, int);

struct EventQueuePayload {
  event_executor fnExecution;
  DataStore* store;
  string command;
  string key;
  string value;
  send_response socketResponseFn;
  int clientSockFileDescriptor;
};

template<typename T>
class Queue{
  private:
    std::vector<T> array;
    int beg = 0;
  public:
    Queue(){};
    
    void enqueue(T item){
        this->array.push_back(item);
    }
    
    T dequeue(){
        return this->array[beg++];
    }
    
    int size(){
        return this->array.size()-beg;
    }
};

template<typename T>
class EventQueue: public Queue<T>{
     public:
        EventQueue(){};
     
        bool hasEventReady(){
            return this->size()>0;
        }
 };


class EventLoop {
    private:
        EventQueue<EventQueuePayload>* queue;
        SocketServer* server;
    public:
        EventLoop(){
            this->queue = new EventQueue<EventQueuePayload>();
            this->server = new SocketServer(8080, 3);
            this->store = new ExtendedDataStore();
        }
        
        void newEvent(EventQueuePayload event){
            this->queue->enqueue(event);
        }
        
        void start(){
            this->server->startServer();
            while(true){
                this->server->reset();

                // //new connection, then connect
                if(this->server->isNewConnection()){
                    this->acceptNewConnection->acceptNewConnection();
                }
                
                // //new incoming data then add to queue
                std::vector<int> fds = this->server->isNewMessage()
                if(fds.size()>0){
                    std::vector<Message> msgs = this->server->acceptNewMessage(fds);
                    for(Message m:msgs){
                        EventQueuePayload e;
                        e.fnExecution = ;
                        e.store = this->store;
                        e.command = m.message.command;
                        e.key = m.message.key;
                        e.value = m.message.value;
                        e.clientSockFileDescriptor = m.sockFd;
                        e.socketResponseFn = ;
                        this->queue->enqueue(e);
                    }
                }
                
                // if data in queue then process it
                if(this->queue->hasEventReady()){
                    EventQueuePayload event = this->queue->dequeue();
                    DataStore* store = event.store;
                    string command = event.command;
                    string key = event.key;
                    string value = event.value;
                    send_response socketResponseFn = event.socketResponseFn;
                    int clientSockFileDescriptor = event.clientSockFileDescriptor;
                    
                    Output eventOutput = event.fnExecution(store, command, key, value);
                    socketResponseFn(eventOutput, clientSockFileDescriptor);
                }
            }
        }
};

typedef void(*addItem)(func_event_ptr);

EventLoop* loop = new EventLoop();

int counter = 0;
// void fnTerminate(){
//      std::this_thread::sleep_for(std::chrono::milliseconds(10000));
//     std::cout<<"TERMINATE "<<std::endl;
// }
// void fn(){
//     if(counter==2){
//         loop->newEvent(fnTerminate);
//     }
//     counter++;
//     std::cout<<"msg"<<std::endl;
// }




int main() {
    // EventQueue<int>* q = new EventQueue<int>();
    // q->enqueue(1);
    // q->enqueue(2);
    // q->enqueue(3);
    // q->dequeue();
    // std::cout<<q->hasEventReady()<<std::endl;
    // loop->newEvent(fn);
    // loop->newEvent(fn);
    // loop->newEvent(fn);
    // loop->newEvent(fn);
    // loop->start();
    
    // DataStore d1;
    // d1.addKeyValue("a","123");
    // d1.addKeyValue("b","456");
    // d1.addKeyValue("c","789");
    
    // cout<<d1.getValue("d")==NULL<<endl;
    
    ExtendedDataStore store;
    store.executeCommand("SET","a", "1");
    store.executeCommand("SET","b", "1");
    store.executeCommand("SET","c", "1");


    Input i = convert_incoming_message("SET a 10 ");
    Input i2 = convert_incoming_message("GET a 10 ");
    Output o = store.executeCommand(i.command, i.key, i.value);
    Output o2 = store.executeCommand(i2.command, i2.key, i2.value);
    cout<<o2.output<<endl;
    
    loop->start();

    return 0;
}




