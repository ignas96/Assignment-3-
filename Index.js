//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//The following is an example of an array of three boards. 
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0", "1", "2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];

var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true },
    { id: '4', boardId: '1', taskName: "Prepare assignment 1", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

//Your endpoints go here

//1.getting the boards
app.get('/api/v1/boards/', (req, res) => {

    var value = boards.map(o => ({ id: o.id, name: o.name, description: o.description }));
    return res.status(200).json(value);
})
// 2.getting all attributes to a specific board
app.get('/api/v1/boards/:boardId', (req, res) => {
    // complete
    var boardId = req.params.boardId
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this id is not a in valid form" })
    }
    for (var i = 0; i < boards.length; i++) {
        if (boardId === boards[i].id) {
            return res.status(200).json(boards[i])
        }
    }
    return res.status(404).json({
        "message": "Error. this id does not exist"
    })
})
//3.Create a new board.

var currentBoardId = 4;

app.post("/api/v1/boards/", (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.description === undefined || req.body.name === "") {
        return res.status(400).json({ "message:": "Error false request" })
    }
    var emptystring = [];
    var newBoard = { id: currentBoardId.toString(), name: req.body.name, description: req.body.description, tasks: emptystring };
    currentBoardId++
    boards.push(newBoard);
    return res.status(201).json(newBoard);

})

//4.update a board.

app.put("/api/v1/boards/:boardId", (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.description === undefined || req.body.name === "") {
        return res.status(400).json({ "message:": "Error false one of the input parameters is not defined or in an invalid form" })
    }
    // console.log(tasks)
    var boardId = req.params.boardId
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this id is not in valid form" })
    }
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].boardId == boardId) {
            // console.log(tasks[i])
            if (!(tasks[i].archived)) {
                return res.status(400).json({ "message:": "Board has non archived tasks" })
            }
        }
    }
    for (var i = 0; i < boards.length; i++) {
        if (boards[i].id == boardId) {
            // if (boards[i].tasks.length != 0) { return res.status(400).json({ "message:": "Board has non archived tasks" }) }
            //boards[i].id = req.body.id
            boards[i].name = req.body.name
            boards[i].description = req.body.description
            return res.status(200).json(boards[i])
        }
    }
    return res.status(404).json({
        "message": "Error. this id does not exist"
    })
})

//5. Delete a board
app.delete('/api/v1/boards/:boardId', (req, res) => {

    var boardId = req.params.boardId
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this id is not in valid form" })
    }
    for (var n = 0; n < tasks.length; n++) {
        if (tasks[n].boardId == boardId & tasks[n].archived == false) {
            return res.status(400).json({ "message:": "Error. Some or all task of the board are not archived" })
        }
    }
    for (var i = 0; i < boards.length; i++) {
        if (boards[i].id == boardId) {
            var deletedBoard = boards[i]
            boards.splice(i, 1);
            return res.status(200).json(deletedBoard)
        }
    }
    return res.status(404).json({ "message": "Error. this id does not exist" })
})


//6. delete all boards
app.delete("/api/v1/boards/", (req, res) => {
    var returnBoards = boards
    for (var i = 0; i < boards.length; i++) {
        for (var j = 0; j < boards[i].tasks.length; j++) {
            for (var k = 0; k < tasks.length; k++) {
                tasks[k].archived = true
                if (tasks[k].id == boards[i].tasks[j])
                    returnBoards[i].tasks[j] = tasks[k]
            }

        }
    }
    boards = []
    tasks = []
    return res.status(200).json(returnBoards)

})



//1.getting task for boards
app.get('/api/v1/boards/:boardId/tasks', (req, res) => {
    var boardId = req.params.boardId
    //checking if boardid is a number
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this id is not in valid form" })
    }
    // checking if board is existing

    for (var i = 0; i < boards.length; i++) {
        var board = boards[i];
        if (board.id == boardId) {
            var tasksInBoard = []; //temporary task which stores boards
            for (var j = 0; j < tasks.length; j++) {
                var task = tasks[j];
                if (task.boardId == boardId) {
                    tasksInBoard.push(task)
                }
            }
            if (req.body.sort == "taskName") {
                tasksInBoard.sort(predicateBy("taskName"))
            }
            if (req.body.sort == "id") {
                tasksInBoard.sort(predicateBy("id"))
            }
            if (req.body.sort == "dateCreated") {
                tasksInBoard.sort(predicateBy("dateCreated"))
            }
            return res.status(200).json(tasksInBoard);
        }
    }
    return res.status(404).json({
        "message": "Error. this id does not exist"
    })
})

//2.getting a specific task
app.get('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId
    var boardId = req.params.boardId
    //checking if boardid is a number
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this boardid is not in valid form" })
    }
    //checking if taskid is a number
    if (isNaN(taskId)) {
        return res.status(404).json({ "message": "Error. this taskid is not in valid form" })
    }
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id == taskId) {
            if (tasks[i].boardId == boardId) {
                return res.status(200).json(tasks[i])
            }
            return res.status(404).json({ "message": " Task and boardid do not match" })
        }
    }
    return res.status(404).json({ "message": "Error. this id does not exist" })
})

//3.creating a task
var currentTaskId = 4;
app.post('/api/v1/boards/:boardId/tasks', (req, res) => {
    var boardId = req.params.boardId
    //checking if boardid is a number
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this boardid is not a number" })
    }

    if (req.body === undefined || req.body.taskName === undefined) {
        return res.status(400).json({ "message:": "Error invalid request body" })
    }

    var newTask = { id: currentTaskId.toString(), boardId: req.params.boardId, taskName: req.body.taskName, dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false }
    tasks.push(newTask);

    //console.log(req.params.boardId)
    for (var i = 0; i < boards.length; i++) {
        if (boards[i].id == boardId) {
            boards[i].tasks.push(currentTaskId.toString())
            currentTaskId++
            return res.status(201).json(newTask);
        }
    }
    //console.log(newTask)
    return res.status(404).json({ "message": "Error. this id does not exist" })
})

//4.deleting a task
app.delete('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId
    var boardId = req.params.boardId
    //checking if boardid is a number
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this boardid is not a number" })
    }
    //checking if taskid is a number
    if (isNaN(taskId)) {
        return res.status(404).json({ "message": "Error. this taskid is not a number" })
    }
    for (var i = 0; i < tasks.length; i++) {
        if (req.params.taskId == tasks[i].id) {
            var deletedTask = tasks[i]
            tasks.splice(i, 1)
            //console.log("deleted1")
        }
        for (var i = 0; i < boards.length; i++) {
            if (req.params.boardId == boards[i].id) {
                for (var j = 0; j < boards[i].tasks.length; j++) {
                    console.log(boards[i].tasks[j])
                    if (boards[i].tasks[j] == req.params.taskId) {
                        boards[i].tasks.splice(j, 1)
                        return res.status(200).json(deletedTask)
                    }
                }
            }
        }
    }
    return res.status(404).json({ "message": "Error. this id does not exist" })

})


//5.partially updating a task
app.patch('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId
    var boardId = req.params.boardId
    //checking if boardid is a number
    if (isNaN(boardId)) {
        return res.status(404).json({ "message": "Error. this boardid is not a number" })
    }
    //checking if taskid is a number
    if (isNaN(taskId)) {
        return res.status(404).json({ "message": "Error. this taskid is not a number" })
    }



    var updated = false
    if (!(req.body.archived === undefined)) {
        if (typeof req.body.archived != "boolean") {
            return res.status(400).json({ "message": "Error. archived is not a boolean" })
        }
        var tasksLength = tasks.length
        for (var i = 0; i < tasksLength; i++) {
            if (req.params.taskId == tasks[i].id) {
                if (tasks[i].boardId != boardId) { return res.status(404).json({ "message": " Task and boardid do not match" }) }
                var returnTask = tasks[i]
                tasks[i].archived = req.body.archived;
                updated = true
            }
        }
    }


    // updating taskname
    if (typeof req.body.taskName == "string") {
        var tasksLength = tasks.length
        for (var i = 0; i < tasksLength; i++) {
            if (tasks[i].id === req.params.taskId) {
                if (tasks[i].boardId != boardId) { return res.status(404).json({ "message": " Task and boardid do not match" }) }
                tasks[i].taskName = req.body.taskName
                updated = true
            }
        }
    }

    // updating boardid 
    if (!(req.body.boardId === undefined)) {
        var tasksLength = tasks.length
        for (var n = 0; n < tasksLength; n++) {
            if (req.params.taskId == tasks[n].id) {
                if (tasks[n].boardId != boardId) { return res.status(400).json({ "message": " Task and boardid do not match" }) }
                tasks[n].boardId = req.body.boardId
            }
        }
        for (var i = 0; boards.length > i; i++) {
            if (req.params.boardId = boards[i].id) {
                for (var j = 0; j < boards[i].tasks.length; j++) {
                    if (boards[i].tasks[j] == req.params.taskId) { boards[i].tasks.splice(j, 1) }
                }
            }
            if (req.body.boardId == boards[i].id) {
                boards[i].tasks.push(req.params.taskId)
                updated = true
            }
        }
    }

    var tasksLength = tasks.length
    for (var n = 0; n < tasksLength; n++) {
        if (tasks[n].id == req.params.taskId) {
            var returnTask = tasks[n]
        }
    }

    if (updated) { return res.status(200).json(returnTask) }
    return res.status(400).json({ "message:": "Error" })
})

function predicateBy(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});



