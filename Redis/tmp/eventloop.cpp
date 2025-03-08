// Online C++ compiler to run C++ program online
#include <iostream>
#include <string>
#include <vector>
#include <cstdint>
#include <thread>
#include <chrono>

using namespace std;

typedef void(*func_event_ptr)(void);

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
        EventQueue<func_event_ptr>* queue;
    public:
        EventLoop(){
            this->queue = new EventQueue<func_event_ptr>();
        }
        
        void newEvent(func_event_ptr event){
            this->queue->enqueue(event);
        }
        
        void start(){
            while(true){
                if(this->queue->hasEventReady()){
                    func_event_ptr event = this->queue->dequeue();
                    event();
                }
            }
        }
};

typedef void(*addItem)(func_event_ptr);

EventLoop* loop = new EventLoop();

int counter = 0;
void fnTerminate(){
     std::this_thread::sleep_for(std::chrono::milliseconds(10000));
    std::cout<<"TERMINATE "<<std::endl;
}
void fn(){
    if(counter==2){
        loop->newEvent(fnTerminate);
    }
    counter++;
    std::cout<<"msg"<<std::endl;
}

int main() {
    // EventQueue<int>* q = new EventQueue<int>();
    // q->enqueue(1);
    // q->enqueue(2);
    // q->enqueue(3);
    // q->dequeue();
    // std::cout<<q->hasEventReady()<<std::endl;
    loop->newEvent(fn);
    loop->newEvent(fn);
    loop->newEvent(fn);
    loop->newEvent(fn);
    loop->start();
    return 0;
}




