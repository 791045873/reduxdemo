//redux有一下三个主要函数
//createStore
//getState  获取当前state
//dispatch  触发state的更新


// 这个reducer是项目中state最终改变的地方
// 这里的enhancer是调用中间件的时候返回给我们的函数，即applyMiddleWare(thunk)的返回值
export function createStore(reducer, enhancer) {
  // 如果存在中间件的返回值，就触发creaestore，得到他返回的store。然后对dispatch做修改，最终作为新的store返回给provider
  if(enhancer){
    return enhancer(createStore)(reducer)
  }
  let currentState = {};
  // currentListener 是订阅事件存放的数组，每当dispatch的时候，都出遍历这个数组去触发事件
  let currentListener = [];

  function getState() {
      return currentState;
  }

  // 监听的事件从这里进入
  function subscribe(listener) {
      currentListener.push(listener);
  }

  // 触发state的改变，触发监听的事件
  function dispatch(action) {
      // 触发state的改变，state代表着整个app的状态，这个状态是由我们维护的，是我们自己描述的
      currentState = reducer(currentState,action);
      // 遍历监听数组中的所有监听事件
      currentListener.forEach(v=>v());
      return action;
  }
  // 在第一次createstore的时候，currentState是应当有值的，所以我们手动触发第一次的dispatch，
  // 因为state只能通过dispatch改变，这里传递一个非常特殊的type类型，用来避开用户编写reducer时所设置的type
  dispatch({type:'@@demoredux'});

  return { getState, subscribe, dispatch }
}

export function applyMiddleWare(...middlewares) {
  return createStore=>(...args)=>{
    const store = createStore(...args);
    let dispatch = store.dispatch;

    const midApi = {
      getState: store.getState,
      dispatch: (...args)=>dispatch(...args)
    };
    // 所有操作的目标都是state，而只有dispatch才可以改变state，所以，中间件就是对dispatch进行一层封装，以实现他想要达到的功能
    // dispatch = middleware(midApi)(store.dispatch);
    // 返回一个数组，这个数组是由准备接受next参数的函数构成的
    const middlewareChain = middlewares.map(middleware=>middleware(midApi));
    dispatch = compose(...middlewareChain)(store.dispatch);
    return {
      ...store,
      dispatch
    }

  }
}

function compose(...funcs) {
  if(funcs.length===0){
    return arg=>arg
  }
  if(funcs.length===1){
    return funcs[0]
  }
  // 获取最后一个函数
	const last = funcs[funcs.length - 1];
	// 获取除最后一个以外的函数[0,length-1)
	const rest = funcs.slice(0, -1);
	// 通过函数 curry 化
	return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
}

// 从createStore返回的对象来看，state是不向外暴露的，只通过store向外暴露的三个方法，去获取，监听以及触发


function bindActionCreator(creator, dispatch) {
  return (...args)=>dispatch(creator(...args));
}
// 这个工具函数用来处理action，因为单独执行action是没有任何效果的，我们需要将所做动作的类型与改变内容传递给dispatch才可以
export function bindActionCreators(creators, dispatch){
  // 将包裹的结果放在bound里
  let bound = {};
  Object.keys(creators).forEach(v=>{
    let creator = creators[v];
    // 我思考过这里为什么不用箭头函数去实现，因为这里需要的是一个自执行函数，用来给返回的函数提供一个作用域去存放dispatch和creator
    // 如果写成剪头函数，无法自执行
    bound[v] = bindActionCreator(creator, dispatch);
  });
  return bound;

  // 可以用reduce进行累加操作,更加的函数式
  // return Object.keys(creators).reduce((res, item)=>{
  //   res[item] = bindActionCreator(creators[item], dispatch)
  // },{});
}
