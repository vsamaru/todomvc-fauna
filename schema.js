const faunadb = require('faunadb');
const q = faunadb.query;

// We are assuming you created a database using https://dashboard.fauna.com
// and have pasted the secret for a server key to that database into
// MY_FAUNADB_SERVER_SECRET

const client = new faunadb.Client({
  secret: MY_FAUNADB_SERVER_SECRET
});

client.query(q.CreateClass({ name: "people" }))
  .then(() => client.query(q.Create(q.Ref('indexes'), {
    name: 'people_by_login',
    source: q.Class("people"),
    terms: [{ field: ['data', 'login'] }],
    unique: true
  })))
  .then(() => client.query(q.Create(q.Ref('indexes'), {
    // this index is optional but useful in development for browsing users
    name: `all_people`,
    source: q.Class("people")
  })))
  .then(() => client.query(q.Create(q.Ref("classes"), {
    name: "todos",
    permissions: {
      create : q.Class("people")
    }
  })))
  .then(() => client.query(
    q.Create(q.Ref("indexes"), {
      name: "all_todos",
      source: q.Class("todos")
      permissions: {
        read : q.Class("people")
      }
  })))
  // create a client key that can provision new users
  .then(() => client.query())
  .then(console.log.bind(console))
  .catch(console.error.bind(console))
