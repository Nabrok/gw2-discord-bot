import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: specializations => AppDispatcher.dispatch({ actionType: 'SPECIALIZATIONS', specializations })
}

