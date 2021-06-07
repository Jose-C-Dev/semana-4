const todos = []
const { validate, validations } = require('indicative/validator')
const { sanitize } = require('indicative/sanitizer')

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

    connection.query('SELECT * FROM todos WHERE todo_id = ? LIMIT 1', [id], (error, results) => {
      if (error) {
        throw error
      }

      res.send(results[0])
    })
  })

  app.post('/todos', (req, res) => {
    const todo = req.body
    const rules = {
      user_id: 'required',
      description: 'required',
      completed: 'required'
    }

    const sanitizationRules = {
      description: 'lowerCase|escape|strip_tags',
      completed: 'escape|strip_tags'
    }

    validate(todo, rules, sanitizationRules)
      .then((results) => {
        sanitize(results, sanitizationRules)
      

      connection.query('INSERT INTO todos SET ?', [todo], (error, results, _) => {
        if (error) {
          throw error
        }

        const { insertId } = results

        connection.query('SELECT * FROM todos WHERE todo_id = ? LIMIT 1', [insertId], (error, results, _) => {
          if (error) {
            throw error
          }
          res.send(results[0])
        })
      })
    }).catch((error) => {
      res.status(400).send(error)
    })
  })

  app.put('/todos/:id', (req, res) => {
    const { id } = req.params

    const todo = req.body

    connection.query('UPDATE todos SET ? WHERE todo_id = ?', [todo, id], (error, results, _) => {
      if (error) {
        throw error
      }

      connection.query('SELECT * FROM todos WHERE todo_id = ? LIMIT 1', [id], (error, results, _) => {
        if (error) {
          throw error
        }

        res.send(results[0])
      })
    })
  })

  app.patch('/todos/:id/completed', (req, res) => {
    const { id } = req.params

    const { completed } = req.body

    const isCompleted = completed ? 0 : 1
    
    connection.query('UPDATE todos SET completed = ? WHERE todo_id = ?', [isCompleted, id], (error, results, _) => {
      if (error) {
        throw error
      }

      res.send(completed)
    })
  })

  app.delete('/todos/:id', (req, res) => {
    const { id } = req.params

    connection.query('SELECT * FROM todos WHERE todo_id = ?', [id], (error, results, _) => {
      if (error) {
        throw error
      }

      const [todo] = results

      connection.query('DELETE FROM todos WHERE todo_id = ?', [id], (error, _, __) => {
        if (error) {
          throw error
        }
        res.send(todo)
      })
    })
  })
}