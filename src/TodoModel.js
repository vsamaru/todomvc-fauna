// const request = require('superagent');

const faunadb = require('faunadb');
const q = faunadb.query;

export default class TodoModel {
	constructor (key) {
		this.key = key;
		this.todos = [];
		this.auth = {}
		this.onChanges = [];
		this.active = false; // todo add observer to client
	}
	subscribe(onChange) {
		this.onChanges.push(onChange);
	}
	inform(reload = true) {
		if (reload) {
			this.getServerTodos().then(()=>{
				this.onChanges.forEach(function (cb) { cb(); });
			})
		} else {
			Promise.resolve("ok").then(() => {
				this.onChanges.forEach(function (cb) { cb(); });
			})
		}
	}
	onAuthChange (auth, reload) {
		this.auth = auth;
		console.log("auth", auth, reload)
		if (reload) {
			this.inform()
		}
	}
	isActive(is) {
		// console.log('isActive', is);
		this.active = is
		this.inform(false)
	}
	getServerTodos() {
		return client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.Get(ref))).then((r) => {this.todos = r.data;})
	}
	addTodo(title) {
		var newTodo = {
			title: title,
			completed: false
		}
    const me = q.Select("ref", q.Get(q.Ref("classes/users/self")));
    newTodo.user = me;
    return client.query(q.Create(q.Ref("classes/todos"), {
      newTodo,
      permissions : {
        read : me,
        write : me
      }
     })).then((r) => {
			this.inform()
		})
	}
	toggleAll(checked) {
    return client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.Update(q.Select("ref", q.Get(ref)),
        { data : {
          completed : q.Not(q.Select(["data", "completed"], q.Get(ref)))
      }}))).then((r) => {
			       this.inform();
		 });
	}
	toggle(todoToToggle) {
		console.log("todoToToggle", todoToToggle)
    client.query(q.Update(todoToToggle.ref,
        { data : {
          completed : !todoToToggle.data.completed,
        }})).then((r) => {
			this.inform()
		})
	}
	destroy(todo) {
    return client.query(q.Delete(todo.ref)).then(() => this.inform());
	}
	save(todoToSave, text) {
    return client.query(q.Update(todoToSave.ref),
      {data : todoToSave.data}).then((r) => this.inform());
	}
	clearCompleted() {
    return client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.If(q.Select(["data", "completed"], q.Get(ref)),
          q.Delete(q.Select("ref", q.Get(ref))),
        true))).then((r) => this.inform());
	}
};
