import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveSkins: skins => AppDispatcher.dispatch({ actionType: 'SKINS', skins })
}

