import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: skills => AppDispatcher.dispatch({ actionType: 'SKILLS', skills })
}

