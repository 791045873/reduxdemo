// context  PropTypes，使用context，必须先定义PropTypes
// 首先在父组件内定义
// static childContextTypes = {}
// getChildContext(){
//     return 想要放入context内部的东西
// }
// 然后，在子组件内部，首先定义proptypes
// static contextTypes = {}
// 使用this.context.*来获取想要的东西

// 这个context，就是provider里存放store的地方

import React from 'react';
import PropTypes from 'prop-types';
import bindActionCreators from './redux';

class Provider extends React.Component{
  static childContextTypes = {
    store: PropTypes.object
  };

  //不清楚这里为什么传入context
  constructor(props, context){
    super(props, context);
    //因为store是我们调用createStore后，以props传递给provider的，所以在这里这样获取
    this.store = props.store;
  }

  getChildContext(){
      return { store: this.store };
  }

  render(){
      return this.props.children;
  }
}

// connect

const connect = (mapStateToProps=state=>state, mapDispatchToProps={})=>(Wrapcomponent)=>(
  class ConnectComponent extends React.Component{
    // 每一个组件都要获取我们写在context里的store
    static contextTypes = {
      store: PropTypes.object
    };
    constructor(props, context){
      super(props, context);
      this.state = {
        props: {}
      }
    }

    componentDidMount(){
      // 不理解这里为什么要订阅update，我觉得mapStateToProps和mapDispatchToProps在写定之后并不会改变
      // 更新是为了update里的setState方法，确保组件在dispatch之后可以更新，可是这样子不就相当于只要有更改
      // 页面所有组件都会强制刷新，会有性能问题吗
      const { store } = this.context;
      store.subscribe(()=>this.update());
      this.update();
    }

    update(){
      //获取mapStateToProps和mapDispatchToProps 放入this.props里
      const { store } = this.context;
      //mapStateToProps和mapDispatchToprops都是由我们写的，我们要告诉子组件，传递给他什么
      const stateProps = mapStateToProps(store.getState());
      const dispatchProps = bindActionCreators(mapDispatchToProps);
      this.setState({
        props: {
          ...this.state.props,
          ...stateProps,
          ...dispatchProps
        }
      })
    }


    render(){
      return <Wrapcomponent {this.state.props}/>
    };


  }
);

export default { Provider }