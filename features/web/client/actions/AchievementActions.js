import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: achievements => AppDispatcher.dispatch({ actionType: 'ACHIEVEMENTS', achievements })
}

