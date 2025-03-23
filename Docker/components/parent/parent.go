package parent

import (
	"fmt"
	"os/exec"
	"os"
	"syscall"
	"github.com/DaveSharma-Hub/Clones/Docker/components/cmd"
	"github.com/DaveSharma-Hub/Clones/Docker/components/errors"
)

func generateNewCommand() *exec.Cmd {
	args, err := cmd.GetOSArgumentRange(2,-1);
	errorGenerator.ErrorCheck(err);

	command := exec.Command("/proc/self/exe", 
	append([]string{"child"},args...)...);
	
	command.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS | syscall.CLONE_NEWPID | syscall.CLONE_NEWNS,
	}
	command.Stdin = os.Stdin;
	command.Stdout = os.Stdout;
	command.Stderr = os.Stderr;

	return command;
}

func Parent(){
	fmt.Println("PARENT");
	command := generateNewCommand();

	if err := command.Run(); err != nil {
		fmt.Println("ERROR", err)
		os.Exit(1)
	}

}