/*----------------- selectors ------------------*/

// Function to quickly select html elements
function $(cssSelector){return document.querySelector(cssSelector)}
function $$$(cssSelectorAll){return document.querySelectorAll(cssSelectorAll)}

// Select grid element for dynamic grid creation
const gridContainer = $(".gridContainer")
const gameContainer = $(".gameContainer")

// Button functionality
const menu = $(".menu")
const difficultyButtons = $$$(".difficultyButton")
const resetGame = $("#reset")
const changeDifficulty = $("#changeDifficulty")
const seeFinalBoard = $$$(".seeFinalBoard")
const seeGameRules = $("#seeGameRules")

// Popup functionality
const popUpContainer = $(".popUpContainer")
const popUps = $$$ (".popUps")
const rulesMessage = $("#rulesMessage")
const winMessage = $("#winMessage")
const loseMessage = $("#loseMessage")

// Player stats functionality
const displayBombCount = $("#displayBombCount")
const displayTimer = $$$("#displayTimer")

// Sound effects
const soundFlag = new Audio ("audio/mixkit-small-hit-in-a-game-2072.wav")
soundFlag.volume = 0.5
const soundWin = new Audio("audio/mixkit-game-bonus-reached-2065.wav")    
soundWin.volume = 0.10

const soundNewGame =  new Audio("audio/mixkit-flute-alert-2307.wav")
// const soundWin = new Audio()
const soundLose = new Audio("audio/mixkit-player-losing-or-failing-2042.wav")
const soundReveal = new Audio("audio/mixkit-game-ball-tap-2073.wav")

const soundRevealMulti = new Audio("audio/mixkit-bonus-earned-in-video-game-2058.wav")
soundRevealMulti.volume = 0.25


/*----------------- constants ------------------*/

const bombPercent = 0.13;

/*----------------- variables ------------------*/

let gridTiles = []; 
let gridTileSize = 30 // HxW dimensions for each grid Tile
let rowCount = 0;
let bombTiles = []
let gridObjArr = []
let bombCountTotal = 0
let safeTilesTotal = 0
let difficulty = ''

let formattedTime = ''
let timer

/*----------------- functions ------------------*/



function updateGlobalVar(name,data) {
    window[name] = data
}

function startGame (difficulty) {
    startTimer()
    
    gridContainer.style.pointerEvents = "auto"

    if (difficulty === 'Easy') {buildGrid(10)}
    if (difficulty === 'Medium') {buildGrid(18)}
    if (difficulty === 'Hard') {buildGrid(24)}
}

function startTimer(){
    let totalSeconds = 0
    displayTimer.forEach((item) =>{item.textContent = 'Time: 00 : 00'})
    timer = setInterval(() => {
        totalSeconds++
        let minutes = Math.floor(totalSeconds/60)
        let seconds = totalSeconds % 60
        formattedTime = (minutes < 10 ? "0":"") + minutes + " : " + (seconds < 10 ? "0":"") + seconds

        // Show timer in-game and on pop-ups
        displayTimer.forEach((item) =>{item.textContent = 'Time: ' + formattedTime})  
    }, 1000)
}



// Builds the grid
function buildGrid(size){    
    // Play newgame sound
    soundNewGame.play();

    // set row and column count, to be used
    rowCount = size;

    // create grid based off difficulty
    let newGrid = document.createElement('div')
    newGrid.className = 'newGrid'
    newGrid.style.height = (size*gridTileSize)+'px';
    newGrid.style.width = (size*gridTileSize)+'px';
    gridContainer.appendChild(newGrid)

    console.log(newGrid)

    // create grid Tiles
    for (let i = 0; i < size*size  ; i++){ 
        let newTile = document.createElement('div')
        //newTile.textContent = i
        newTile.className = 'grid-tile'
        newTile.classList.add("unknown")
        newTile.id = 'tile'+i
        newGrid.appendChild(newTile);
    }

    // add selectors to each grid Tile
    gridTiles = $$$(".grid-tile")

    // place bombs
    placeBombs(gridTiles)

     // Assign bomb counts on Tiles
    placeCounts(gridTiles);
    
    updateGlobalVar('bombCountTotal',bombCountTotal)
    
    // Attach listeners
    attachListeners()

}

// Places bombs
function placeBombs(arr){
    bombCountTotal = Math.floor((rowCount*rowCount)*bombPercent)
    
    for (let i = 0; i < (bombCountTotal); i++){
        let randomNumber = Math.floor(Math.random()*(rowCount*rowCount))
        if (arr[randomNumber].classList.contains("bomb")){
            randomNumber = Math.floor(Math.random()*(rowCount*rowCount))
            arr[randomNumber].classList.add("bomb")
        } else {
        arr[randomNumber].classList.add("bomb")
        }
    }
    // Display active bombs to player
    displayBombCount.textContent = 'Active Bombs: '+bombCountTotal
}



// Builds tile objects
function placeCounts(arr){

    // Create object array for all tiles
    for (let i = 0; i < arr.length; i++){
        let obj = {}

        // store the index
        obj.index = i

        // store the position
        obj.row = Math.floor(obj.index / Math.sqrt(arr.length) + 1)
        obj.column = obj.index % Math.sqrt(arr.length) + 1
        obj.position = obj.row+'-'+obj.column

        // store nearby Tiles [ TL,ML,RL,L,R,BL,BM,MR ]
        obj.adjTiles = []
            obj.adjTiles[0] = i - (rowCount + 1) // top left
            obj.adjTiles[1] = i - (rowCount) // top mid
            obj.adjTiles[2] = i - (rowCount - 1)  // top right
            obj.adjTiles[3] = i - 1
            obj.adjTiles[4] = i + 1
            obj.adjTiles[5] = i + (rowCount - 1) // bot left
            obj.adjTiles[6] = i + (rowCount) // bot mid
            obj.adjTiles[7] = i + (rowCount + 1) // bot right

        // store the bomb status
        if (arr[i].classList.contains("bomb")) {obj.bomb = true} 
        else {obj.bomb = false}
    
        gridObjArr.push(obj)

    }
    
    // Clean the adj tile array on edge tiles and corner tiles
    gridObjArr.forEach((tile)=>{
        
        // Clean up corners
        if (tile.row === 1 && tile.column === 1) {
            tile.adjTiles.forEach((item,index,arr) => {arr[0] = null; arr[1] = null; arr[2] = null; arr[3] = null; arr[5] = null})
        }
        if (tile.row === 1 && tile.column === rowCount) {
            tile.adjTiles.forEach((item,index,arr) => {arr[0] = null; arr[1] = null; arr[2] = null; arr[4] = null; arr[7] = null})
        }
        if (tile.row === rowCount && tile.column === rowCount) {
            tile.adjTiles.forEach((item,index,arr) => {arr[2] = null; arr[4] = null; arr[5] = null; arr[6] = null; arr[7] = null})
        }
        if (tile.row === rowCount && tile.column === 1) {
            tile.adjTiles.forEach((item,index,arr) => {arr[0] = null; arr[3] = null; arr[5] = null; arr[6] = null; arr[7] = null})
        }
        
        // Clean up rest by row and column
        if (tile.row === 1) {
            tile.adjTiles.forEach((item,index,arr) => {arr[0] = null; arr[1] = null; arr[2] = null})
        }
        if (tile.row === rowCount) {
            tile.adjTiles.forEach((item,index,arr) => {arr[5] = null; arr[6] = null; arr[7] = null})
        }
        if (tile.column === 1) {
            tile.adjTiles.forEach((item,index,arr) => {arr[0] = null; arr[3] = null; arr[5] = null})
        }
        if (tile.column === rowCount) {
            tile.adjTiles.forEach((item,index,arr) => {arr[2] = null; arr[4] = null; arr[7] = null})
        }
    })

    // Create bombTile list
    gridObjArr.forEach((tile) => {
        if (tile.bomb === true) {bombTiles.push(tile.index)}
    })
    // console.log(bombTiles)

    // Count bombs found in adjacent tiles
    gridObjArr.forEach((tile,index) => {
        let bombCount = 0;
        for (let adjTile of tile.adjTiles) {
            if (bombTiles.includes(adjTile)){bombCount++}
        }
        tile.bombCount = bombCount

       // Show bombCount on the div tile
        if (tile.bombCount > 0 && tile.bomb === false) {
            arr[index].textContent = bombCount
            if (bombCount === 1) {arr[index].classList.add("one")}
            if (bombCount === 2) {arr[index].classList.add("two")}
            if (bombCount === 3) {arr[index].classList.add("three")}
            if (bombCount === 4) {arr[index].classList.add("four")}
            if (bombCount === 5) {arr[index].classList.add("five")}
            if (bombCount === 6) {arr[index].classList.add("six")}
            if (bombCount === 7) {arr[index].classList.add("seven")}
            if (bombCount === 8) {arr[index].classList.add("eight")}
        }
    })
}


function checkWin(){
    let count = 0; 
    gridTiles.forEach((tile) => {
        if (!tile.classList.contains("safe")) {count++}
    }) 

    if (count === bombCountTotal) {
        // make WIN pop-up appear here
        soundWin.play()
        showBombs()

        // Disable all clicks on board
        gridContainer.style.pointerEvents = "none"
        
        popUpContainer.style.display = "flex"
        winMessage.style.display = "block"
        clearInterval(timer)
    }

}

function lose(){
    soundLose.play();
    showBombs()
    popUpContainer.style.display = "flex"
    loseMessage.style.display = "block"

    // Disable all clicks on board
    gridContainer.style.pointerEvents = "none"
    
    clearInterval(timer)
}

function reset(){
    let selectGrid = $(".newGrid");
    selectGrid.remove();
    gridObjArr = [];
    gridTiles = [];
    bombTiles = [];
    bombCountTotal = 0;
    safeTilesTotal = 0;
    formattedTime = ''
    clearInterval(timer)
}

function showBombs(){
    gridTiles.forEach((tile) => {
        if (tile.classList.contains("bomb")) {
            tile.classList.add("bombClicked")
        }
    })
}


/*----------------- listeners ------------------*/


// Game setup UX listeners

seeGameRules.addEventListener('click',() => {
    popUpContainer.style.display = "flex"
    rulesMessage.style.display = "block"
})

popUpContainer.addEventListener('click', () => {
    popUpContainer.style.display = "none"
    popUps.forEach((popUp) => {popUp.style.display = "none"})
})

// Tile listeners
function attachListeners(){
    gridTiles.forEach((tile) => {  
      
        tile.addEventListener('click',(event) => {
            // if bomb, end game
            if (event.target.classList.contains("bomb")){
                event.target.classList.add("bombClicked")
                lose()
            }

            // if not a bomb
            if (!event.target.classList.contains("bomb")){
                
                soundReveal.play()

                // Add 'safe' class to the tile div
                event.target.classList.add("safe")
                event.target.classList.remove("unknown")
                
                // If adj tile also has no bombCount reveal any adjacent tiles that also have no bomb count
                if (!event.target.textContent){
                    soundRevealMulti.play()
                    revealAdjTiles(event.target.id.substring(4),1)
                } 
                checkWin()
            }
        })
    })

    // Flagging feature
    gridTiles.forEach((tile) => {
        tile.addEventListener('contextmenu', (event) => {
            event.preventDefault()    
            
            // Remove flag
            if (event.target.classList.contains("flagged")) {
                event.target.classList.remove("flagged")
                soundFlag.play()
            } 
            // Add flag
            else {
                event.target.classList.add("flagged")
                soundFlag.play()
            }
        })    
    })
}

// Game buttons
resetGame.addEventListener('click',() => {
    reset()
    startGame(difficulty)
})

// Star
changeDifficulty.addEventListener('click', () => {
    clearInterval(timer)
    gameContainer.style.display = ''
    menu.style.display = 'flex'
})

difficultyButtons.forEach((button) => {
    button.addEventListener ('click',(event) => {
        if (!difficulty) {
            console.log(difficulty)
            difficulty = event.target.textContent
            gameLive = false
            startGame(difficulty)
        } else {
            gameLive = false
            reset()
            difficulty = event.target.textContent
            startGame(difficulty)
        }
        gameContainer.style.display = 'block' // show game
        menu.style.display = 'none';
    })  
})


seeFinalBoard.forEach((button) => {
    button.addEventListener('click', () => {
        popUpContainer.style.display = "none"
    })
})

/*-------------- Reveal Tile Loops ----------------- */

let num = 0
let adjTilesNoBCounts = []

function revealAdjTiles (index, num) {
    if (num <= 0) {
        return;
    } else {
        gridObjArr[index].adjTiles.forEach((item) =>{
            if (item != null) {
                // If no bombcount found on tile, then check for more adj tiles without bombcounts
                if (gridObjArr[item].bomb === false && gridObjArr[item].bombCount === 0 && !gridTiles[item].classList.contains("safe")){
                    adjTilesNoBCounts.push(item)
                    num++
                    gridTiles[item].classList.add("safe")
                    gridTiles[item].classList.remove("unknown")
                    revealAdjTiles(item, num - 1)
                }

                // If bombcount found on tile, just mark it safe
                else if (gridObjArr[item].bomb=== false) {
                    gridTiles[item].classList.add("safe")
                    gridTiles[item].classList.remove("unknown")
                    
                }
            }
        })
    }
}
