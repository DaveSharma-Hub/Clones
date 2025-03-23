package errorGenerator

import (
	"errors"
)

func CreateError(message string) error {
	return errors.New(message);
}

func ErrorCheck(err error) {
	if(err != nil) {
		panic(err);
	}
}