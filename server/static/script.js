const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let blockGridX = 50;
let blockGridY = 50;

// Set canvas size to match its display size and device pixel ratio
function resizeCanvas() {
	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;
	ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transforms
	ctx.scale(dpr, dpr); // Scale for crisp lines
}

function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Set grid style
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 0.1;

	// Draw vertical lines
	for (let x = 0; x <= canvas.width; x += 20) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
		ctx.stroke();
	}

	// Draw horizontal lines
	for (let y = 0; y <= canvas.height; y += 20) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();
	}
}

let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// Update drawGrid to use panX and panY
function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 0.1;

	const dpr = window.devicePixelRatio || 1;
	const width = canvas.width / dpr;
	const height = canvas.height / dpr;

	// Draw vertical lines
	for (let x = panX % 20; x <= width; x += 20) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}

	// Draw horizontal lines
	for (let y = panY % 20; y <= height; y += 20) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

function updateBlockPosition() {
	draggableDiv.style.left = blockGridX + panX + "px";
	draggableDiv.style.top = blockGridY + panY + "px";
}

// Mouse events for panning
canvas.addEventListener("mousedown", function (e) {
	// Only pan if not clicking on a block
	if (e.target === canvas && e.button === 0) {
		// left mouse button
		isPanning = true;
		panStartX = e.clientX - panX;
		panStartY = e.clientY - panY;
		document.body.style.cursor = "grab";
	}
});

document.addEventListener("mousemove", function (e) {
	if (isPanning) {
		panX = e.clientX - panStartX;
		panY = e.clientY - panStartY;
		drawGrid();
		updateBlockPosition();
	}
});

document.addEventListener("mouseup", function () {
	isPanning = false;
	document.body.style.cursor = "";
});

const draggableDiv = document.getElementById("block");
const container = document.querySelector(".container");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

draggableDiv.addEventListener("mousedown", function (e) {
	isDragging = true;
	draggableDiv.classList.add("dragging");
	const rect = draggableDiv.getBoundingClientRect();
	offsetX = e.clientX - rect.left;
	offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", function (e) {
	if (!isDragging) return;
	const containerRect = container.getBoundingClientRect();
	blockGridX = e.clientX - containerRect.left - offsetX - panX;
	blockGridY = e.clientY - containerRect.top - offsetY - panY;
	updateBlockPosition();
});

document.addEventListener("mouseup", function () {
	isDragging = false;
	draggableDiv.classList.remove("dragging");
});

window.addEventListener("resize", () => {
	resizeCanvas();
	drawGrid();
	updateBlockPosition();
});

resizeCanvas();
drawGrid();
updateBlockPosition();
