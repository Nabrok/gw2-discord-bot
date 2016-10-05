import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receive: channels => AppDispatcher.dispatch({ actionType: 'DISCORD CHANNEL', channels })
}
