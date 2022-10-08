const diskTop = peg => {
    return peg.disks[0] ? peg.disks[0].offsetTop - (DISK_HEIGHT + DISK_GAP) : peg.bottom - DISK_HEIGHT;
}
const setup = (diskCount, home) => {
    movesMade = 0;
    movesTotal = Math.pow(2, parseInt(diskInput.value, 10)) - 1;
    moveTotalDiv.innerHTML = movesTotal;
    movesMadeDiv.innerHTML = 0;
    pegsDiv = document.getElementById('pegs');
    DISK_HEIGHT = Math.min(MAX_DISK_HEIGHT, (pegsDiv.offsetHeight - (diskCount * DISK_GAP)) / (diskCount + 1));
    // get pegs display info
    for (const pegKey in pegs) {
        let peg = pegs[pegKey];
        let div = document.getElementById(`peg-${pegKey}`);
        peg.centerX = div.offsetLeft + div.offsetWidth / 2;
        peg.width = div.offsetWidth;
        peg.bottom = div.offsetTop + div.offsetHeight;
        peg.diskCount = 0;
        peg.disks = [];
    }
    // create disks and put them on the home peg
    widthDelta = (MAX_DISK_WIDTH - MIN_DISK_WIDTH) / diskCount;
    let disks = document.getElementById('disks');
    disks.innerHTML = '';
    for (let diskIndex = 0; diskIndex < diskCount; diskIndex++) {
        let disk = document.createElement('div');
        let width = MAX_DISK_WIDTH - (widthDelta * diskIndex);
        let height = DISK_HEIGHT;
        let left = pegs[home].centerX - width / 2;
        let top = diskTop(pegs[home]);
        disk.className = 'disk';
        disk.style.width = width;
        disk.style.height = height;
        disk.style.top = top;
        disk.style.left = left;
        disks.append(disk);
        pegs[home].disks.unshift(disk);
    }
};

const sleep = ms => (new Promise(resolve => (setTimeout(resolve, ms))));

const moveDisk = async (home, dest) => {
    // raise disk
    let disk = pegs[home].disks[0];
    while (disk.offsetTop - speed > -(DISK_HEIGHT + 10)) {
        disk.style.top = disk.offsetTop - speed;
        await sleep(DELAY_MS);
    }
    disk.style.top = -(DISK_HEIGHT + 10);
    // slide disk
    let dir = Math.sign(-(pegs[home].centerX - pegs[dest].centerX));
    if (dir < 0) {
        while (disk.offsetLeft + (dir * speed) > pegs[dest].centerX - disk.offsetWidth / 2) {
            disk.style.left = disk.offsetLeft + (dir * speed);
            await sleep(DELAY_MS);
        }
    } else {
        while (disk.offsetLeft + (dir * speed) < pegs[dest].centerX - disk.offsetWidth / 2) {
            disk.style.left = disk.offsetLeft + (dir * speed);
            await sleep(DELAY_MS);
        }
    }
    disk.style.left = pegs[dest].centerX - disk.offsetWidth / 2;
    // lower disk
    while (disk.offsetTop + speed < diskTop(pegs[dest])) {
        disk.style.top = disk.offsetTop + speed;
        await sleep(DELAY_MS);
    }
    disk.style.top = diskTop(pegs[dest]);
    pegs[dest].disks.unshift(disk);
    pegs[home].disks.splice(0, 1);

    // Compute move time stats
    movesMade++;
    movesMadeDiv.innerHTML = movesMade;
    let percentComplete = movesMade / movesTotal
    movesPercentDiv.innerHTML = (percentComplete * 100).toFixed(3);
    let dt = Date.now() - startTime;
    let timePerMove = dt / movesMade;
    let remainingTime = (movesTotal - movesMade) * timePerMove;
    timeRemainingDiv.innerHTML = `${(remainingTime / 60000).toFixed(2)} mins`;

    await sleep(0);

}

const tower = async (disk, home, dest, temp) => {
    if (disk === 1 && !stop) await moveDisk(home, dest);
    else {
        if (!stop) await tower(disk - 1, home, temp, dest);
        if (!stop) await moveDisk(home, dest);
        if (!stop) await tower(disk - 1, temp, dest, home);
    }
}

let pegs = {
    'a': {
        disks: [],
        centerX: 0,
        width: 0,
        height: 0
    },
    'b': {
        disks: [],
        centerX: 0,
        width: 0,
        height: 0
    },
    'c': {
        disks: [],
        centerX: 0,
        width: 0,
        height: 0
    }
}

const MAX_DISK_WIDTH = 300;
const MIN_DISK_WIDTH = 60;
const MAX_DISK_HEIGHT = 30;
const DISK_GAP = 1;
const DELAY_MS = 1;
let DISK_HEIGHT = MAX_DISK_HEIGHT;
let stop = false;
let diskInput = document.getElementById('disk-count');
let start = document.getElementById('start');
let stopButton = document.getElementById('stop');
let speedSlider = document.getElementById('speed');
let moveTotalDiv = document.getElementById('moves-total');
let movesMadeDiv = document.getElementById('moves-made');
let movesPercentDiv = document.getElementById('moves-percent');
let timeRemainingDiv = document.getElementById('time-remaining');
let movesMade = 0;
let movesTotal = 0;
let startTime = 0;
let speed = parseInt(speedSlider.value, 10);
let diskCount = parseInt(diskInput.value, 10);
movesTotal = Math.pow(2, parseInt(diskInput.value, 10)) - 1;
moveTotalDiv.innerHTML = movesTotal;

setup(diskCount, 'a');
// UI event handlers

speedSlider.oninput = (e) => {
    speed = parseInt(e.target.value, 10);
}

diskInput.onkeyup = () => {
    if (stop) {
        let diskCount = parseInt(diskInput.value, 10);
        movesTotal = Math.pow(2, diskCount) - 1;
        moveTotal.innerHTML = movesTotal;
        setup(diskCount, 'a');
    }
}

start.onclick = async (e) => {
    start.disabled = true;
    diskInput.disabled = true;
    stop = false;
    diskCount = parseInt(diskInput.value, 10);
    setup(diskCount, 'a');
    startTime = Date.now();
    await tower(diskCount, 'a', 'c', 'b');
}

stopButton.onclick = () => {
    stop = true;
    diskInput.disabled = false;
    start.disabled = false;
}