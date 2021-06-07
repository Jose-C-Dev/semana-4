const todos = []

module.exports = (app, connection) => {
  app.get('/todos', (req, res) => {
    const { limit, page } = req.query

    const _limit = +limit
    const _page = +page

    connection.query('SELECT COUNT(todo_id) FROM todos', (error, countResults, _) => {
      if (error) {
        throw error
      }

      const offset = (_page - 1) * _limit
      const total = countResults[0]['COUNT(todo_id)']
      const pageCount = Math.ceil(total / limit)
      
      connection.query('SELECT * FROM todos LIMIT ?, ?', [offset, _limit], (error, results, _) => {
        if (error) {
          throw error
        }

        res.send({
          code: 200,
          meta: {
            pagination: {
              total: total,
              pages: pageCount,
              page: _page,
              limit: _limit
            }
          },
          data: results
        })
      })
    })
  })

  app.get('/todos/:id', (req, res) => {
    const { id } = req.params

    res.send(todos.find((todo) => todo.id == id))
  })

  app.post('/todos', (req, res) => {
    const todo = req.body

    todo.id = todos.length + 1

    todos.push(todo)

    res.send(todo)
  })
}