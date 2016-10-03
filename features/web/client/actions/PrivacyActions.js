import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: privacy => AppDispatcher.dispatch({ actionType: 'PRIVACY', privacy })
}
