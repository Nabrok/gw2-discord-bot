import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: professions => AppDispatcher.dispatch({ actionType: 'PROFESSIONS', professions })
}

