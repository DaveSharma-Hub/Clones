// Online Go compiler to run Golang program online
// Print "Try programiz.pro" message

package main
import (
    "fmt"
    "time"
)

type ChannelReturnType <-chan int;
type PublisherFunction func(ch chan int);
type SubscriberFunction func(input int);
func RoutineChannelFactory(fn PublisherFunction)ChannelReturnType{
    ch := make(chan int);
    go (func(){
        fn(ch);
    })();
    return ch;
}

func ChannelFanInOut(channels []ChannelReturnType)ChannelReturnType{
    ch := make(chan int);
    for _, channel := range(channels){
        go (func(){
            ch <- <- channel
        })();
    }
    return ch;
}


type AddPublisher func(fn PublisherFunction);
type AddSubscriber func(fn SubscriberFunction);
type CommonFn func();
type PubSubFanIn struct {
    publishers []PublisherFunction;
    subscribers []SubscriberFunction;
    channels []ChannelReturnType;
    addPublisher AddPublisher;
    addSubscriber AddSubscriber;
    start CommonFn;
};

func PublishMessageFanInFactory()*PubSubFanIn{
    publishers := []PublisherFunction{};
    subscribers := []SubscriberFunction{};
    channels := []ChannelReturnType{};
    
    addPublisher := func(fn PublisherFunction){
        publishers = append(publishers, fn);
    }
    
    addSubscriber := func(fn SubscriberFunction){
        subscribers = append(subscribers, fn);
    }
    
    start := func(){
        // main := make(chan int);
        for _, fn := range(publishers){
            ch := RoutineChannelFactory(fn);
            go (func(){
                // main <- <- ch;
                for {
                    value := <- ch;
                    for _, sub := range(subscribers) {
                        // value := <- main;
                        sub(value);
                    }
                }
            })();
            channels = append(channels, ch);
        }
    }
    
    pubSub := PubSubFanIn{publishers, subscribers, channels, addPublisher, addSubscriber, start};
    
    return &pubSub;
}

func main() {

//   first := RoutineChannelFactory(func(ch chan int){
//       for i:=0 ;i<10; i++ {
//         time.Sleep(2 * time.Second);
//         ch <- 1;
//       }
//   });
//   second := RoutineChannelFactory(func(ch chan int){
//       for i:=0 ;i<10;i++ {
//         time.Sleep(2 * time.Second);
//         ch <- 2;
//       }
//   });
//   third := RoutineChannelFactory(func(ch chan int){
//       for i:=0 ;i<10;i++ {
//         time.Sleep(2 * time.Second);
//         ch <- 3;
//       }
//   });
    
//   finalCh := ChannelFanInOut([]ChannelReturnType{first, second, third});
//   fmt.Println(<-finalCh);

  pubSub := PublishMessageFanInFactory();
  pubSub.addPublisher(func(ch chan int){
      for i:=0 ;i<10; i++ {
        fmt.Println("H")
        time.Sleep(2 * time.Second);
        ch <- 1;
      }
  });
  pubSub.addPublisher(func(ch chan int){
      for i:=0 ;i<10; i++ {
        time.Sleep(2 * time.Second);
        ch <- 2;
      }
  });
  pubSub.addPublisher(func(ch chan int){
      for i:=0 ;i<10; i++ {
        time.Sleep(2 * time.Second);
        ch <- 3;
      }
  });
  
  pubSub.addSubscriber(func(val int){
      fmt.Println("VALUE", val);
  });
  
  pubSub.start();
//   for i:=0;i==0; {
      
//   }
    time.Sleep(20 * time.Second);
  fmt.Println("Try programiz.pro")
}