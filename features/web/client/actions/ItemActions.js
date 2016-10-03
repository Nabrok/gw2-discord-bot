import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveItems: items => AppDispatcher.dispatch({ actionType: 'ITEMS', items })
}
