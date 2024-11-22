// API endpoint for code execution

import { readStdin, createFile, executeCode } from "@/utils/execUtils";

const LANGS = ["Python", "Java", "JavaScript", "C", "C++"];
const COMPILED = ["Java", "C", "C++"];
const INTERPRETED = ["Python", "JavaScript"];


export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { code, lang, stdin } = req.body;

    if (!code || !lang) {
        return res.status(400).json({
            message: "Please provide all the required fields",
        });
    }

    if(!LANGS.includes(lang)) {
        return res.status(400).json({
            message: "This language is not supported.",
        });
    }

    // creates a file on server
    const filename = createFile(code, lang);
    if(filename === "FILE ERROR") {
    	return res.status(503).json({ error: "File System Error" });
    }

    // pass in stdin as args to execute
    const args = readStdin(stdin);

    // runs created file with given arguments
    const result = executeCode(filename, lang, args);
  
    // TODO for part 2: change format of return value for better UX
    if(COMPILED.includes(lang)) {
        return res.status(200).json({
            compOut: result[0],
            compErr: result[1],
            runOut: result[2],
            runErr: result[3]
        });
    } else {
        return res.status(200).json({
            output: result[0],
            error: result[1]
        });
    }
}
  
