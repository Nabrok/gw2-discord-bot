import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveColors: colors => AppDispatcher.dispatch({ actionType: 'COLORS', colors })
}
