package main
import (
    "fmt"
    "sync"
    "time"
)

type Common func();
type QueuePayload struct {
    fn Common;
}

type Enqueue func(payload QueuePayload);
type Dequeue func()*QueuePayload;
type Size func()int;
type Queue struct {
    arr []QueuePayload;
    enqueue Enqueue;
    dequeue Dequeue;
    size Size;
}

func QueueFactory()*Queue{
    arr := []QueuePayload{};
    
    enqueue := func(payload QueuePayload){
        arr = append(arr, payload);
    }
    
    dequeue := func()*QueuePayload{
        if(len(arr)>0){
            value := arr[0];
            arr = arr[1:];
            return &value;
        }
        return nil
    }
    size := func()int{
        return len(arr);
    }
    
    queue := Queue{arr, enqueue, dequeue, size};
    return &queue;
}

type NewWorkerFnType func(fn Common);
type WorkerPool struct {
    maxWorkers int;
    currentWorkers *int;
    createNewWorker NewWorkerFnType;
    wait Common;
    workerQueue *Queue;
}

func checkNext(workerQueue *Queue, currentWorkers *int, maxWorkers int, wg *sync.WaitGroup){
    if(workerQueue.size()>0 && *currentWorkers<maxWorkers){
        item := workerQueue.dequeue();
        (*currentWorkers)++;
        go (func(){
            defer wg.Done();
            item.fn();
            (*currentWorkers) --;
            checkNext(workerQueue, currentWorkers, maxWorkers, wg);
        })();
        wg.Add(1);
    }
}

func WorkerPoolFactory(maxWorkers int)*WorkerPool{
    currentWorkers := new(int);
    *currentWorkers = 0;
    
    workerQueue := QueueFactory();
    
    var wg sync.WaitGroup;
    
    createPayload := func(fn Common)QueuePayload{
        payload := QueuePayload{fn};
        return payload;
    }
    

    createNewWorker:= func(fn Common){
        payload := createPayload(fn);
        workerQueue.enqueue(payload);
        checkNext(workerQueue, currentWorkers, maxWorkers, &wg);
    }
    
    wait := func(){
        wg.Wait();
    }
    
    pool := WorkerPool{maxWorkers, currentWorkers, createNewWorker, wait, workerQueue};
    return &pool;
}

func main() {
  pool := WorkerPoolFactory(2);
  time.Sleep(1 * time.Second);
  pool.createNewWorker(func(){
      fmt.Println("hello");
  });

  pool.createNewWorker(func(){
      fmt.Println("world");
  });  time.Sleep(1 * time.Second);

  pool.createNewWorker(func(){
      fmt.Println("again");
  });
  pool.wait();
  fmt.Println("Try programiz.pro")
}