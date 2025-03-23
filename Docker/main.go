package main

import (
	"fmt"
	"github.com/DaveSharma-Hub/Clones/Docker/components/child"
	"github.com/DaveSharma-Hub/Clones/Docker/components/parent"
)

func main(){

	fmt.Println("Main");
	parent();
	child();
}