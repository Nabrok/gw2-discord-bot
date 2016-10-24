import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: currencies => AppDispatcher.dispatch({ actionType: 'CURRENCIES', currencies })
}

