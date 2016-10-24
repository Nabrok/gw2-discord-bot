import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: categories => AppDispatcher.dispatch({ actionType: 'ACHIEVEMENT_CATEGORIES', categories })
}

