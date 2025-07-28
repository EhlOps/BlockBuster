import Block from "./block.js";
import { getState, setState } from "./state.js";\\\\\\\\\\\

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const contextMenu = document.getElementById("contextMenu");
const container = document.querySelector(".container");
const blockButtons = document.querySelectorAll(".block-button");

const block_types = await fetch("/blocks").then((response) => response.json());

// Set canvas size to match its display size and device pixel ratio
function resizeCanvas() {
	const rect = canvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}

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

		new Block(++blockCounter, x - 30, y - 20, selectedBlockType); // Center the block on click

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
