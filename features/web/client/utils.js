const iconBackgrounds = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#1b5e20', '#33691e', '#827717', '#e65100', '#ff5722', '#795548', '#607d8b'];

export function randomColor(str) {
	return iconBackgrounds[Array.prototype.reduce.call(str, (cur, next) => {
		return cur + next.charCodeAt();
	}, 0) % iconBackgrounds.length];
}
