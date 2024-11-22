// NOTE: all user stories for code execution are for 'visitors', and we dont need to do PRISMA database stuff

// PART 2
// check Piazza @200
// helper function that reads from stdin, returns sanitized string 
export function readStdin(input) {
    // TODO for part 2: take input from user, and sanitize/process it as necessary
    if (!input) {
        return "";
    }
    // for part 1, we are only using handmade inputs
    return input;
}

// creates a file with the respective extension, given code as a string 
// return filename on success
export function createFile(code, lang) {
    // set filename and extension based on lang
    // API should ensure lang is one of the below
    let filename = "";
    if(lang === "Python") {
        filename = "py.py";
    } else if (lang === "C") {
        filename = "c.c";
    } else if (lang === "C++") {
        filename = "cpp.cpp";
    } else if (lang === "Java") {
        filename = "Main.java";
    } else if (lang === "JavaScript") {
        filename = "js.js";
    }

    // writes text to file
    const fs = require('fs');
    try {
    	fs.writeFileSync(filename, code);
    }
    catch (err) {
    	return "FILE ERROR";
    }
    return filename;
}

// runs code.c, code.cpp etc using node's child_process.execSync(), and returns results of the execution
export function executeCode(filename, lang, args) {
    const { execSync } = require('node:child_process');
    
    if (lang === "Python" || lang === "JavaScript") {
        // the command to run
        let command = "";
        if (lang === "Python") {
            command = "python3 " + filename + " " + args;
        } else {
            command = "node " + filename + " " + args;
        }

        // run execSync with command, and return output as string
        try {
  	    let result = execSync(command);
 	    return [result.toString(), "No Error!"];
	}
	catch (err){ 
	    return [err.stderr.toString(), err.name];
	}
	
    } else {
    	// the compile command to run
    	let compile = "";
        if (lang === "C") {
            compile = "gcc " + filename;
        } else if (lang === "C++") {
            compile = "g++ " + filename;
        } else {
            compile = "javac " + filename;
        }
        // run execSync with compile to compile the file
        try {
  	    let compileResult = execSync(compile);
  	    // now get command
  	    let command = "";
  	    if (lang === "Java") {
                command = "java Main " + args;
            } else {
                command = "./a.out " + args;
            }
            // run execSync with command, and return output as string
            try {
  	        let result = execSync(command);
 	        return [compileResult.toString(), "No Error!", result.toString(), "No Error!"];
	    }
	    catch (err){ 
	        return [compileResult.toString(), "No Error!", err.stderr.toString(), err.name];
	    }
	}
    	catch (err){ 
	    return [err.stderr.toString(), err.name, "Compile Failed", "Compile Failed"];
	}
    }
}

