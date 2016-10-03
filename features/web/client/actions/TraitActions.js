import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: traits => AppDispatcher.dispatch({ actionType: 'TRAITS', traits })
}

