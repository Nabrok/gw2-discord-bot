import AppDispatcher from '../dispatchers/AppDispatcher';

export default {
	receiveOutfits: outfits => AppDispatcher.dispatch({ actionType: 'OUTFITS', outfits })
}
