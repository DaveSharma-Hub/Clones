#include <iostream>
#include <map>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <fcntl.h>
#include <cstring>
#include <arpa/inet.h>
#include <sys/select.h>

using namespace std;

#define MAX_KEY_SIZE 30;
#define MAX_COMMAND_SIZE 3;
#define MAX_VALUE_SIZE 991;
// adds to max buffer size
#define BUFFER_SIZE 1024;

struct Output{
    string output;
    string message;
}typedef Output;

struct Input{
    string command;
    string key;
    string value;
}typedef Input;

struct Message {
    int sockFd;
    Input message;
}typedef Message;

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

class SocketServer{
    private:
        int maxConnections;
        struct sockaddr_in serverAddress;
        int serverSocketFd;
        struct fd_set readFds;
        std::vector<int> clientSocketPool;

    public:
    SocketServer(uint port, int maxConnections){
        this->maxConnections = maxConnections;
        this->serverSocketFd = socket(AF_INET, SOCK_STREAM, 0);

        if(this->serverSocketFd==0){
            perror("socket failed");
            exit(EXIT_FAILURE);
        }
        int opt = 1;

        if (setsockopt(this->serverSocketFd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
            perror("Setsockopt failed");
            exit(EXIT_FAILURE);
        }

        this->serverAddress.sin_family = AF_INET;
        this->serverAddress.sin_port = htons(port);
        this->serverAddress.sin_addr.s_addr = INADDR_ANY;

        if(bind(this->serverSocketFd, (struct sockaddr*)&(this->serverAddress), sizeof(this->serverAddress))<0){
            perror("Bind failure");
            exit(EXIT_FAILURE);
        }
    }

    void startServer(){
        if(listen(this->serverSocketFd, this->maxConnections)<0){
            perror("Listen failure");
            exit(EXIT_FAILURE);
        }
        fcntl(this->serverSocketFd, F_SETFL, O_NONBLOCK);
        // listen(serverSocketFd, this->maxConnections);
        std::cout<<"Server waiting for connections..."<<std::endl;
    }

    void reset(){
        FD_ZERO(&this->readFds);
        FD_SET(this->serverSocketFd, &(this->readFds));

        timeval timeout;
        timeout.tv_usec = 10000;
        int activity = select(this->serverSocketFd + 1, &(this->readFds), nullptr, nullptr, timeout);

        if (activity < 0) {
            perror("Select error");
            return;
        }
    }

    bool isNewConnection(){
       return FD_ISSET(this->serverSocketFd, &(this->readFds));
    }

    void acceptNewConnection(){
        socklen_t addrlen = sizeof(this->serverAddress);
        int newSocketFd;
        if ((newSocketFd = accept(this->serverSocketFd, (struct sockaddr*)&(this->serverAddress), &addrlen)) < 0) {
            perror("Accept failed");
            return;
        }

        fcntl(newSocketFd, F_SETFL, O_NONBLOCK);
        this->clientSocketPool.push_back(newSocketFd);
    }

    std::vector<int> isNewMessage(){
        std::vector<int> fds;
        for(int clientSocketFd: this->.clientSocketPool){
            if(clientSocketFd != -1 && FD_ISSET(clientSocketFd, &(this->readFds))){
                fds.push_back(clientSocketFd);
            }
        }
        return fds;
    }

    std::vector<Message> acceptNewMessage(std::vector<int> clientFds){
        std::vector<Message> msgs;

        for(int i=0;i<clientFds.size();i++){
            int fd = clientFds[i];
            char buffer[BUFFER_SIZE] = {0};
            ssize_t valread = recv(client_socket, buffer, sizeof(buffer), 0);
            if(valread < 0){
                perror("Error reading client data");
            }else if (valread == 0) {
                std::cout << "Client disconnected." << std::endl;
                close(fd);
                // remove from pool
                continue;
            }else{
                buffer[valread] = '\0';
                Input i = convert_incoming_message(std::string(buffer));
                Message m1;
                m1.message = i;
                m1.sockFd = fd;
                msgs.push_back(m1);
            }
        }
        return msgs;
    }
};