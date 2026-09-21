import './style.css'
const input = document.getElementById("commandInput");
const output = document.getElementById("output");
const terminalBody = document.querySelector(".terminal-body");
// ============================================================
// COMMAND HISTORY
// ============================================================

const commandHistory = [];

let historyIndex = -1;

// ============================================================
// DATA
// ============================================================

let portfolioData = null;


// Cargar el JSON antes de utilizar la terminal
async function loadPortfolio() {

    try {

        const response = await fetch("/data/portfolio.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        portfolioData = await response.json();

        console.log("Portfolio data loaded:", portfolioData);

    } catch (error) {

        console.error("Error loading portfolio.json:", error);

        printOutput(
            "ERROR\n    Unable to load portfolio data."
        );

    }

}


// ============================================================
// COMMANDS
// ============================================================

const availableCommands = {

    help: () => {

        return `
Available commands:

  about       About me
  projects    My projects
  skills      My skills
  contact     Contact information
  open        Open a project
  clear       Clear terminal
`;
    },


    about: () => {

        const profile = portfolioData.profile;

        return `
NAME
    ${profile.name}

USERNAME
    ${profile.username}

ROLE
    ${profile.role}

LOCATION
    ${profile.location}

ABOUT
    ${profile.description}
`;
    },


    projects: () => {

        const projects = portfolioData.projects;

        if (!projects || projects.length === 0) {

            return `
PROJECTS

    No projects available.
`;
        }


        let result = `
PROJECTS
────────────────────────────────────────

`;

        projects.forEach((project, index) => {

            result += `[${String(index + 1).padStart(2, "0")}] ${project.name}\n`;

            result += `     ${project.description}\n`;

            result += `     ${project.technologies.join(" · ")}\n`;

            result += `     $ open ${project.id}\n\n`;

        });


        return result;

    },


    skills: () => {

        const skills = portfolioData.skills;

        let result = `
SKILLS
────────────────────────────────────────

`;

        if (skills.languages) {

            result += `Programming\n`;

            skills.languages.forEach(skill => {

                result += `    ${skill}\n`;

            });

            result += `\n`;

        }


        if (skills.embedded) {

            result += `Embedded\n`;

            skills.embedded.forEach(skill => {

                result += `    ${skill}\n`;

            });

            result += `\n`;

        }


        if (skills.iot) {

            result += `IoT\n`;

            skills.iot.forEach(skill => {

                result += `    ${skill}\n`;

            });

            result += `\n`;

        }


        if (skills.web) {

            result += `Web\n`;

            skills.web.forEach(skill => {

                result += `    ${skill}\n`;

            });

        }


        return result;

    },


    contact: () => {

        const contact = portfolioData.contact;

        return `
CONTACT
────────────────────────────────────────

GitHub
    ${contact.github}

LinkedIn
    ${contact.linkedin}

Email
    ${contact.email}
`;

    }

};


// ============================================================
// INPUT
// ============================================================

input.addEventListener("keydown", function(event) {

    // ========================================================
    // ENTER
    // ========================================================

    if (event.key === "Enter") {

        const command = input.value.trim();

        if (!command) {
            return;
        }

        // Guardar comando en historial
        commandHistory.push(command);

        // Posicionarnos después del último comando
        historyIndex = commandHistory.length;

        executeCommand(command);

        input.value = "";

        return;
    }


    // ========================================================
    // ARROW UP
    // ========================================================

    if (event.key === "ArrowUp") {

        event.preventDefault();

        if (commandHistory.length === 0) {
            return;
        }

        if (historyIndex > 0) {
            historyIndex--;
        }

        input.value = commandHistory[historyIndex];

        // Colocar cursor al final
        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

        return;
    }


    // ========================================================
    // ARROW DOWN
    // ========================================================

    if (event.key === "ArrowDown") {

        event.preventDefault();

        if (commandHistory.length === 0) {
            return;
        }

        if (historyIndex < commandHistory.length - 1) {

            historyIndex++;

            input.value = commandHistory[historyIndex];

        } else {

            historyIndex = commandHistory.length;

            input.value = "";

        }

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

        return;
    }

});


// ============================================================
// COMMAND EXECUTION
// ============================================================

function executeCommand(command) {

    if (!portfolioData) {

        printOutput(
            "ERROR\n    Portfolio data is still loading..."
        );

        return;

    }


    // Mostrar el comando introducido

    printCommand(command);


    // Convertir el comando en partes

    const parts = command.trim().split(/\s+/);

    const baseCommand = parts[0].toLowerCase();

    const argument = parts.slice(1).join(" ");


    // ========================================================
    // CLEAR
    // ========================================================

    if (baseCommand === "clear") {

        output.innerHTML = "";

        return;

    }


    // ========================================================
    // OPEN
    // ========================================================

    if (baseCommand === "open") {

        if (!argument) {

            printOutput(`
Usage

    open <project>

Example

    open mqtt-iot
`);

            return;

        }


        openProject(argument);

        return;

    }


    // ========================================================
    // COMMAND
    // ========================================================

    if (availableCommands[baseCommand]) {

        const response = availableCommands[baseCommand]();

        printOutput(response);

        return;

    }


    // ========================================================
    // UNKNOWN COMMAND
    // ========================================================

    printOutput(
        `command not found: ${baseCommand}\n\nType "help" to see available commands.`
    );

}


// ============================================================
// OPEN PROJECT
// ============================================================

function openProject(projectId) {

    const project = portfolioData.projects.find(
        project => project.id.toLowerCase() === projectId.toLowerCase()
    );


    if (!project) {

        printOutput(
            `ERROR\n    Project "${projectId}" not found.\n\nType "projects" to see available projects.`
        );

        return;

    }


    let result = `
${project.name}
────────────────────────────────────────

DESCRIPTION

    ${project.description}

TECHNOLOGIES

`;


    project.technologies.forEach(technology => {

        result += `    ${technology}\n`;

    });


    if (project.image) {

        result += `
IMAGE

    ${project.image}
`;

    }


    if (project.github) {

        result += `
GITHUB

    ${project.github}
`;

    }


    printOutput(result);

}


// ============================================================
// PRINT COMMAND
// ============================================================

function printCommand(command) {

    const commandLine = document.createElement("p");


    const prompt = document.createElement("span");

    prompt.className = "prompt";

    prompt.textContent = "user@portfolio:~$";


    commandLine.appendChild(prompt);

    commandLine.appendChild(
        document.createTextNode(` ${command}`)
    );


    output.appendChild(commandLine);

}


// ============================================================
// PRINT OUTPUT
// ============================================================

function printOutput(text) {

    const response = document.createElement("pre");

    response.textContent = text;

    output.appendChild(response);


    scrollToBottom();

}


// ============================================================
// SCROLL
// ============================================================

function scrollToBottom() {

    terminalBody.scrollTop = terminalBody.scrollHeight;

}


// ============================================================
// KEEP INPUT FOCUSED
// ============================================================

document.addEventListener("click", function() {

    input.focus();

});


// ============================================================
// INITIALIZE
// ============================================================

loadPortfolio();