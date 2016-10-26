import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	add: () => setTimeout(() => AppDispatcher.dispatch({ actionType: 'ADD LOADER' }), 1),
	remove: () => setTimeout(() => AppDispatcher.dispatch({ actionType: 'DEL LOADER' }), 1)
}
