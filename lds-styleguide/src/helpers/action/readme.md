# Action
a dispatcher for subscribing and broadcasting predefined events.

action.on('found new controller', 'dummy', callback);
action.off('found new controller', 'dummy', callback);
action.emit('please find controller', 'dummy');
