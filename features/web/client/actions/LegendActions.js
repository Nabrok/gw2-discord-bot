import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: legends => AppDispatcher.dispatch({ actionType: 'LEGENDS', legends })
}

