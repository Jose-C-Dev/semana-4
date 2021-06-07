const express = require('express')
const bodyParser = require('body-parser')

const { validate, validations } = require('indicative/validator')
const { sanitize } = require('indicative/sanitizer')

const PORT = 3000

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/users', (req, res) => {
  const data = req.body

  const rules = {
    name: 'required',
    email: 'required:active|email',
    username: 'required|alphaNumeric',
    active: 'boolean',
    phone: [
      validations.required,
      validations.regex(['^((\\+|00)\\d{1,3}\\s{1})?\\d{9}$']),
    ],
  }

  const sanitizationRules = {
    name: 'trim|escape|strip_tags',
    username: 'lowerCase|escape|strip_tags',
    email: 'escape|strip_tags',
    username: 'escape|strip_tags',
    active: 'escape|strip_tags',
    phone: 'escape|strip_tags',
  }

  validate(data, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)
      
      res.send(value)
    }).catch((error) => {
      res.status(400).send(error)
    })
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})