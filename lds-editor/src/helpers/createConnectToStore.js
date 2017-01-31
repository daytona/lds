import shallowEquals from 'shallow-equals';

export default function createConnectToStore(store) {
  return function connectToStore(selectState, listener) {
    // if(typeof selectState !== 'Function')
    //   throw new Error('Expected the `selectState` param to be a function.');

    // if(typeof listener !== 'Function')
    //   throw new Error('Expected the `listener` param to be a function.');

    let currentState = selectState(store.getState());
    let unsubscribeFromStore;
    let unsubscribed = false;

    const handleStoreChange = () => {
      const newState = selectState(store.getState());

      if(shallowEquals(currentState, newState))
        return;

      currentState = newState;

      if(!unsubscribed)
        listener(currentState);
    };

    unsubscribeFromStore = store.subscribe(handleStoreChange);

    listener(currentState);

    return () => {
      unsubscribed = true;
      unsubscribeFromStore();
    };
  };
}