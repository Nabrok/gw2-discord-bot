import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveStats: stats => AppDispatcher.dispatch({ actionType: 'STATS', stats })
}
