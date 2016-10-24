import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: prices => AppDispatcher.dispatch({ actionType: 'PRICES', prices })
}

