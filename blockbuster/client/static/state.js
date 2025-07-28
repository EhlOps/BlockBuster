let state = {
	blocks: [],
	blockCounter: 0,
	selectedBlockType: null,
	selectedBlock: null,
	isPlacingMode: false,
	panX: 0,
	panY: 0,
	isPanning: false,
	panStartX: 0,
	panStartY: 0,
};

export const getState = async (field) => {
	if (state[field]) {
		return state[field];
	}
	return null;
};

export const setState = async (field, value) => {
	state[field] = value;
};
