// Online C++ compiler to run C++ program online
#include <iostream>
#include <string>
#include <vector>
#include <cstdint>
#include <thread>
#include <chrono>
#include <map>

using namespace std;

typedef void(*func_event_ptr)(void);

struct Output{
    string output;
    string message;
}typedef Output;

struct Input{
    string command;
    string key;
    string value;
}typedef Input;

Input convert_incoming_message(string input){
    Input i1;
    int first = input.find(" ");
    i1.command = input.substr(0, first);
    string substring1 = input.substr(first+1, input.length()-1);
    int second = substring1.find(" ");
    i1.key = substring1.substr(0, second);
    if(i1.command == "SET"){
        string substring2 = substring1.substr(second+1, substring1.length()-1);
        i1.value =substring2;
    }
    return i1;
}

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
        
    public:
        EventLoop(){
            this->queue = new EventQueue<EventQueuePayload>();
        }
        
        void newEvent(EventQueuePayload event){
            this->queue->enqueue(event);
        }
        
        void start(){
            while(true){
                
                // //new connection, then connect
                // if(){
                    
                // }
                
                // //new incoming data then add to queue
                // if(){
                    
                // }
                
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
    
    return 0;
}




