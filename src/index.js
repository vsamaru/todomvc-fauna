import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import TodoModel from './TodoModel'
import './index.css';
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

var model = new TodoModel('react-todos');

function render() {
  ReactDOM.render(
    <App model={model}/>,
    document.getElementsByClassName('todoapp')[0]
  );
}

model.subscribe(render);
render();
