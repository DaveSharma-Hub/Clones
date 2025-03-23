package cmd

import (
	"os"
	"github.com/DaveSharma-Hub/Clones/Docker/components/errors"
)

func GetOSArguments(pos int) (string, error) {
	length := len(os.Args);
	if(pos < length){
		return string(os.Args[pos]), nil;
	}
	return "", errorGenerator.CreateError("Argument position larger than cmd args provided");
}
func GetOSArgumentRange(beg, end int) ([]string, error) {
	length := len(os.Args);
	if(beg <= end && end < length){
		return os.Args[beg:end], nil;
	} else if( end == -1 && beg < length){
		return os.Args[beg:], nil;
	}
	return []string{}, errorGenerator.CreateError("Argument position larger than cmd args provided");
}