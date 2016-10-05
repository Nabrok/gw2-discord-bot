import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: servers => AppDispatcher.dispatch({ actionType: 'DISCORD SERVER', servers })
}
