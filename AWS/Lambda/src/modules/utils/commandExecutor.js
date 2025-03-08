import childProcess from 'child_process';

export const execute_command = async(command) => {
    return new Promise((res, rej)=>{
        childProcess.exec(command, (error, stdout, stderr) => {
            console.log(stdout, stderr, error);
            if(error){
                rej(error);
            }
            if(stderr){
                res(stderr);
            }
            if(stdout){
                res(stdout);
            }
        });
    });
}