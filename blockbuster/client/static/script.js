const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const contextMenu = document.getElementById("contextMenu");
const container = document.querySelector(".container");
const blockButtons = document.querySelectorAll(".block-button");

let blockCounter = 0;
let blocks = [];
let selectedBlockType = null;
let selectedBlock = null;
let isPlacingMode = false;

// Set canvas size to match its display size and device pixel ratio
function resizeCanvas() {
	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}

let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

function drawGrid() {
	const dpr = window.devicePixelRatio || 1;
	const width = canvas.width / dpr;
	const height = canvas.height / dpr;

	ctx.clearRect(0, 0, width, height);

	ctx.strokeStyle = "#e0e0e0";
	ctx.lineWidth = 0.5;

	// Calculate grid offset, handling negative values
	const gridSize = 20;
	const startX = ((panX % gridSize) + gridSize) % gridSize;
	const startY = ((panY % gridSize) + gridSize) % gridSize;

	// Draw vertical lines
	for (let x = startX; x <= width; x += gridSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}

	// Draw horizontal lines
	for (let y = startY; y <= height; y += gridSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

// Block class to manage individual blocks
class Block {
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.id = ++blockCounter;
		this.element = this.createElement();
		this.isDragging = false;
		this.offsetX = 0;
		this.offsetY = 0;
		this.value = 0; // For input blocks

		blocks.push(this);
		this.updatePosition();
		this.attachEventListeners();
	}

	createElement() {
		const div = document.createElement("div");
		div.className = `block ${this.type}`;
		div.id = `block-${this.id}`;

		switch (this.type) {
			case "add":
				div.textContent = "+";
				break;
			case "subtract":
				div.textContent = "-";
				break;
			case "input":
				const input = document.createElement("input");
				input.type = "number";
				input.value = "0";
				input.placeholder = "0";
				input.addEventListener("click", (e) => e.stopPropagation());
				input.addEventListener("mousedown", (e) => e.stopPropagation());
				input.addEventListener("change", (e) => {
					this.value = parseFloat(e.target.value) || 0;
				});
				div.appendChild(input);
				break;
		}

		container.appendChild(div);
		return div;
	}

	updatePosition() {
		this.element.style.left = this.x + panX + "px";
		this.element.style.top = this.y + panY + "px";
	}

	attachEventListeners() {
		this.element.addEventListener("mousedown", (e) => {
			if (e.button === 0 && e.target === this.element) {
				this.isDragging = true;
				this.element.classList.add("dragging");
				const rect = this.element.getBoundingClientRect();
				this.offsetX = e.clientX - rect.left;
				this.offsetY = e.clientY - rect.top;
				selectedBlock = this;
				e.preventDefault();
			}
		});

		this.element.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			selectedBlock = this;
			showContextMenu(e.clientX, e.clientY, true);
		});
	}

	move(clientX, clientY) {
		if (!this.isDragging) return;
		const containerRect = container.getBoundingClientRect();
		this.x = clientX - containerRect.left - this.offsetX - panX;
		this.y = clientY - containerRect.top - this.offsetY - panY;
		this.updatePosition();
	}

	stopDragging() {
		this.isDragging = false;
		this.element.classList.remove("dragging");
	}

	remove() {
		this.element.remove();
		const index = blocks.indexOf(this);
		if (index > -1) {
			blocks.splice(index, 1);
		}
	}
}

function updateAllBlockPositions() {
	blocks.forEach((block) => block.updatePosition());
}

function showContextMenu(x, y, hasSelectedBlock = false) {
	const deleteItem = contextMenu.querySelector('[data-action="delete-block"]');
	if (hasSelectedBlock) {
		deleteItem.classList.remove("disabled");
	} else {
		deleteItem.classList.add("disabled");
	}

	contextMenu.style.display = "block";
	contextMenu.style.left = x + "px";
	contextMenu.style.top = y + "px";

	// Ensure menu stays within viewport
	const rect = contextMenu.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	if (rect.right > viewportWidth) {
		contextMenu.style.left = x - rect.width + "px";
	}
	if (rect.bottom > viewportHeight) {
		contextMenu.style.top = y - rect.height + "px";
	}
}

function hideContextMenu() {
	contextMenu.style.display = "none";
	selectedBlock = null;
}

function deleteSelectedBlock() {
	if (selectedBlock) {
		selectedBlock.remove();
		selectedBlock = null;
	}
}

function resetView() {
	panX = 0;
	panY = 0;
	drawGrid();
	updateAllBlockPositions();
}

function clearAllBlocks() {
	blocks.forEach((block) => block.remove());
	blocks = [];
	blockCounter = 0;
}

// Top menu event listeners
blockButtons.forEach((button) => {
	button.addEventListener("click", () => {
		// Remove active class from all buttons
		blockButtons.forEach((btn) => btn.classList.remove("active"));

		// Add active class to clicked button
		button.classList.add("active");

		selectedBlockType = button.getAttribute("data-block-type");
		isPlacingMode = true;
		canvas.style.cursor = "crosshair";
	});
});

// Canvas click to place blocks
canvas.addEventListener("click", function (e) {
	if (isPlacingMode && selectedBlockType) {
		const containerRect = container.getBoundingClientRect();
		const x = e.clientX - containerRect.left - panX;
		const y = e.clientY - containerRect.top - panY;

		new Block(x - 30, y - 20, selectedBlockType); // Center the block on click

		// Reset placing mode
		isPlacingMode = false;
		selectedBlockType = null;
		canvas.style.cursor = "";
		blockButtons.forEach((btn) => btn.classList.remove("active"));
	}
});

// Mouse events for panning
canvas.addEventListener("mousedown", function (e) {
	if (e.target === canvas && e.button === 0 && !isPlacingMode) {
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
		updateAllBlockPositions();
	} else {
		// Handle block dragging
		blocks.forEach((block) => {
			if (block.isDragging) {
				block.move(e.clientX, e.clientY);
			}
		});
	}
});

document.addEventListener("mouseup", function () {
	isPanning = false;
	document.body.style.cursor = "";

	// Stop all block dragging
	blocks.forEach((block) => block.stopDragging());
});

// Context menu events
canvas.addEventListener("contextmenu", function (e) {
	if (e.target === canvas) {
		e.preventDefault();
		showContextMenu(e.clientX, e.clientY, false);
	}
});

document.addEventListener("click", function (e) {
	if (!contextMenu.contains(e.target)) {
		hideContextMenu();
	}
});

contextMenu.addEventListener("click", function (e) {
	const action = e.target.getAttribute("data-action");
	if (!action || e.target.classList.contains("disabled")) return;

	switch (action) {
		case "delete-block":
			deleteSelectedBlock();
			break;
		case "reset-view":
			resetView();
			break;
		case "clear-all":
			clearAllBlocks();
			break;
	}
	hideContextMenu();
});

// Escape key to cancel placing mode
document.addEventListener("keydown", function (e) {
	if (e.key === "Escape" && isPlacingMode) {
		isPlacingMode = false;
		selectedBlockType = null;
		canvas.style.cursor = "";
		blockButtons.forEach((btn) => btn.classList.remove("active"));
	}
});

window.addEventListener("resize", () => {
	resizeCanvas();
	drawGrid();
	updateAllBlockPositions();
});

// Initialize
resizeCanvas();
drawGrid();
