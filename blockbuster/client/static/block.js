import { getState } from "./state.js";

const container = document.querySelector(".container");

export default class Block {
	constructor(id, x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.id = id;
		this.element = this.createElement();
		this.isDragging = false;
		this.offsetX = 0;
		this.offsetY = 0;
		this.value = 0; // For input blocks

		getState("blocks").push(this);
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
		this.element.style.left = this.x + getState("panX") + "px";
		this.element.style.top = this.y + getState("panY") + "px";
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
		this.x = clientX - containerRect.left - this.offsetX - getState("panX");
		this.y = clientY - containerRect.top - this.offsetY - getState("panY");
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
