// The init will be called when onload or when 'Restart' is clicked or after the game is finished.
const init = () => {
    document.querySelector("#cards").innerHTML = "";
    document.querySelector("#hearts").innerHTML = "❤️";
    document.querySelector("#timer").innerHTML = "Time: 00:00";
    selectDifficultyMenu();
    easyModeBtn.addEventListener('click', () => buildGame(false));
    hardModeBtn.addEventListener('click', () => buildGame(true));
}

// This will be called once everytime from 'init' to create a div as overlay on top of the container to allow selecting the difficulty before starting the game.
const selectDifficultyMenu = () => {
    menu = document.createElement('div');
    menu.id = "menu";
    const h1 = document.createElement("h1");
    h1.innerHTML = "Memory Card Game";
    const hardModeBtn = document.createElement('button')
    hardModeBtn.id = "hardModeBtn";
    hardModeBtn.innerHTML = "Hard Mode"
    const easyModeBtn = document.createElement('button')
    easyModeBtn.id = "easyModeBtn";
    easyModeBtn.innerHTML = "Easy Mode"
    const btnBox = document.createElement('div');
    btnBox.innerHTML += "<p>Select Difficulty!</p>"
    btnBox.id = "btnBox";
    btnBox.append(easyModeBtn, hardModeBtn);
    const recordsBox = document.createElement('div');
    recordsBox.id = "records";
    loadRecords(recordsBox);
    menu.append(h1);
    menu.append(btnBox);
    menu.append(recordsBox);
    document.body.append(menu);
}

const loadRecords = (recordBox) => {
    if(localStorage.records === undefined || JSON.parse(localStorage.records).length === 0){
        recordBox.innerHTML = "No previous records... for now..."
    }
    else{
        const records = JSON.parse(localStorage.records);
        records.forEach((data) => {
            const record = createRecord(data);
            recordBox.append(record);
        })
    } 
}

const createRecord = (data) => {
    const record = document.createElement('div');
    record.classList.add("record");
    let dataDisplay = "";
    if(data.win === true){
        dataDisplay += "<p>WIN.</p>";
        record.classList.add("winRecord"); 
    }
    else{
        dataDisplay += "<p>LOSE.</p>";
        record.classList.add("loseRecord"); 
    }
    dataDisplay += "<p>Time: " + addZeroIfLessThanTen(data.time.minutes) + ":" + addZeroIfLessThanTen(data.time.seconds) + "</p>";
    dataDisplay += "<p>Lives: " + data.lives + "</p>";
    if(data.hardMode === true){
        dataDisplay += "<p>Mode: Hard.</p>";
    } 
    else{
        dataDisplay += "<p>Mode: Easy.</p>";
    }
    dataDisplay += "<button id = delRecord >&#x2716;</button>"
    record.innerHTML = dataDisplay;
    record.children[4].addEventListener("click", () => {
        removeFromRecords(record)
        if(document.querySelector("#records").children.length = 0){
            document.querySelector("#records").innerHTML = "No previous records... for now...";
        }

    })
    return record;
}

const removeFromRecords = (record) => {
    const recordsBox = document.querySelector("#records").children;
    let removeIndex;
    for(let i = 0; i < recordsBox.length; i++){
        if(recordsBox[i] === record){
            removeIndex = i;
            record.remove();
        }
    }
    let records = JSON.parse(localStorage.records);
    records = records.filter((element, index) => {
        if(index === removeIndex){
            console.log("hi");
            return false;
        }
        return true;
    })
    localStorage.setItem("records", JSON.stringify(records));
}

// The 'buildGame' function will, based on the selected difficulty, prepere the cards, their content when flipped, randomize their order and display them in the 'cards' div. 
const buildGame = (hardMode) => {
    document.querySelector("#menu").remove();
    if(window.innerWidth > 1300)
        document.body.style.paddingTop = "80px";
    else 
        document.body.style.paddingTop = "16px"
    const restartBtn = document.querySelector("#restart");
    restartBtn.addEventListener('click', restart);
    let cardContent = getCardsContent(hardMode);
    cardContent = sortRandomly(cardContent);
    display(cardContent, hardMode);
    play(cardContent, hardMode)
}

// This will be called in the 'buildGame' function. it will initiate the array that contains the cards content when flipped, fill the array with content based on the accepted difficulty and returns the array.
const getCardsContent = (hardMode) => {
    let cardContent = [];
    if(hardMode){
        cardContent = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"];
    }
    else{
        cardContent = ["<img src = assets/circle.svg>", "<img src = assets/circle.svg>", "<img src = assets/square.svg>", "<img src = assets/square.svg>", "<img src = assets/star.svg>", "<img src = assets/star.svg>", "<img src = assets/triangle.svg>", "<img src = assets/triangle.svg>"];
    }
    return cardContent;
}

// This will be called right after the 'getCardsContent' function. The function accepts the content array and based on it it will, create, randomize the order of the elements and return a new randomized array.
const sortRandomly = (cardContent) => {
    const randomizedArr = [];
    while(cardContent.length != 0){
        let rnd = Math.floor(Math.random() * cardContent.length);
        randomizedArr.push(cardContent[rnd])
        cardContent = cardContent.filter((elem , index) => {
            if(index === rnd) return false;
            else return true;
        })
    }
    return randomizedArr;
}

// The 'Display' function is called in the 'buildGame' funtion. it accepts the content array to display the number of cards and the selected difficulty to display the hearts (lives) the user has left.
const display = (cardContent, hardMode) => {
    const cards = document.querySelector("#cards");
    for(let i = 0; i < cardContent.length; i++){
        cards.innerHTML += `<div class="card">&#x3f;</div>`
    }
    const hearts = document.querySelector("#hearts");
    if(hardMode) hearts.innerHTML = "❤️❤️❤️❤️❤️❤️";
    else hearts.innerHTML = "❤️❤️❤️❤️❤️";
}

// The 'play' function defines the main behavior of the game. it is called after the 'buildGame' function. The function will start the timer and define the functionality of the cards when clicked.
const play = (cardContent, hardMode) => {
    const gameData = {
        win: false,
        hardMode: hardMode,
        lives: document.querySelector("#hearts").innerText.length/2,
        time: {
            minutes: 0,
            seconds: 0
        }
    };
    startTimer(gameData);
    let matchAttempt = [];
    document.querySelectorAll(".card").forEach((card, index) => {
        card.matchFound = false;
        card.flipped = false;
        card.addEventListener('click', () => {
            if(!card.matchFound && !card.flipped){
                card.flipped = true;
                card.innerHTML = cardContent[index];
                matchAttempt.push(card);
                if(matchAttempt.length === 2){
                    checkAttempt(matchAttempt, gameData);
                    matchAttempt = [];
                }
            }
        })
    })
}

// The 'startTimer' function is called in the 'play' function. it initiates the timer and starting the interval to display in the 'Timer div' the time it took to finish. Very usefull for speedrunners.  
const startTimer = (gameData) => {
    const timer = document.querySelector("#timer");
    timer.interval = setInterval(() => {
        gameData.time.seconds++;
        if(gameData.time.seconds === 60){
            gameData.time.seconds = 0;
            gameData.minutes++;
        }
        timer.innerHTML = "Time: " + addZeroIfLessThanTen(gameData.time.minutes) + ":" + addZeroIfLessThanTen(gameData.time.seconds);
    }, 1000);
    document.querySelector("#restart").addEventListener('click', () => {
        clearInterval(timer.interval);
    })
}
// This function serves as a tool in 'startTimer' function to display the timer correctly as 'two digits : two digits'.
const addZeroIfLessThanTen = (num) =>{
    if(num < 10) return "0" + num;
    else return num;
}

// The 'checkAttempt' function is called in the 'play' function every time the user selects two cards to check if they match. If they match they will stay flipped, else they will flip back and the user will lose a heart. The function will call the 'checkProgress' function once every time to check the progress of the game.
const checkAttempt = (matchAttempt, gameData) => {
    if(matchAttempt[0].innerHTML === matchAttempt[1].innerHTML){
        for(let i = 0; i < matchAttempt.length; i++){
            matchAttempt[i].style.background = "rgb(0, 220, 0)";
            matchAttempt[i].matchFound = true;
            setTimeout(()=>{
                matchAttempt[i].style.background = "rgb(70, 70, 255)"
            }, 1000)
        }
    }
    else{
        const hearts = document.querySelector("#hearts");
        hearts.innerHTML = hearts.innerHTML.substring(2);
        gameData.lives--;
        for(let i = 0; i < matchAttempt.length; i++){
            matchAttempt[i].style.background = "rgb(220, 0, 0)";
            setTimeout(()=>{
                matchAttempt[i].style.background = "rgb(70, 70, 255)"
                matchAttempt[i].innerHTML = `&#x3f;`;
                matchAttempt[i].flipped = false;
            }, 1000)
        }
    }
    checkProgress(gameData);
}

// The 'checkProgress' function is called once everytime at the end of the 'checkAttempt' function to check if all the cards have found their match. if they did the function will call the 'gameFinish' function. else the game will continue. This function will also call the 'gameOver' function if all hearts are lost.
const checkProgress = (gameData) => {
    if(gameData.lives === 0)
        gameOver(gameData);
    const cards = document.querySelectorAll(".card");
    let allMatched = true;
    for(let i = 0; i < cards.length; i++){
        if(!cards[i].matchFound) allMatched = false
    }
    if(allMatched) gameFinish(gameData);
}

// The 'gameFinish' function is called in the 'checkProgress' function once all the cards found their match. The function stop the timer and congratulate the user for their 'hard-earned' victory. The function will then restart the game back to selecting difficulty. GGWP.
const gameFinish = (gameData) => {
    gameData.win = true;
    clearInterval(document.querySelector("#timer").interval);
    const time = document.querySelector("#timer").innerHTML.split(" ")[1];
    const minutes = time.split(":")[0];
    const seconds = time.split(":")[1];
    let records = [];
    if(localStorage.records !== undefined){
        records = JSON.parse(localStorage.records);
    }
    records.unshift(gameData);
    localStorage.setItem("records", JSON.stringify(records));
    setTimeout(() => {
        alert("GGWP \n Finished in: " + minutes + " Minutes and " + seconds + " Seconds");
        restart();
    }, 1150)
}

// The 'gameOver' function is called in the 'checkProgress' function if all hearts have been lost. The function will humiliate the user to the point of no recovery. The function will then restart the game back to selecting difficulty. GIT GUD CASUL LMFAO.
const gameOver = (gameData) => {
    gameData.win = false;
    clearInterval(document.querySelector("#timer").interval);
    let records = [];
    if(localStorage.records !== undefined){
        records = JSON.parse(localStorage.records);
    }
    records.unshift(gameData);
    localStorage.setItem("records", JSON.stringify(records));
    setTimeout(() => {
        alert("GIT GUD CASUL \n LMFAO WHAT A NOOB LOL");
        restart();
    }, 1200)
}

// The 'restart' function will, quite simply, call the 'init' function. thereby restarting the game.
const restart = () => init();

// call 'init' onload.
init();