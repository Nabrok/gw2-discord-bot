import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveToken: token => AppDispatcher.dispatch({ actionType: 'TOKEN', token })
}
