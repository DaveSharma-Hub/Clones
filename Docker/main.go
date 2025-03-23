package main

import (
	"github.com/DaveSharma-Hub/Clones/Docker/components/child"
	"github.com/DaveSharma-Hub/Clones/Docker/components/parent"
	"github.com/DaveSharma-Hub/Clones/Docker/components/cmd"
	"github.com/DaveSharma-Hub/Clones/Docker/components/errors"
)

func main(){
	argument, err := cmd.GetOSArguments(1);
	errorGenerator.ErrorCheck(err);
	
	switch argument {
		case "run":
			parent.Parent();
		case "child":
			child.Child();
		default:
			panic("Invalid argument");
	}
}