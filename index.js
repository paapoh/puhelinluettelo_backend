require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('jsonify', (req, res) => { return JSON.stringify(req.body)})
app.use(morgan((tokens, req, res) => (
    [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.jsonify(req, res)
    ].join(' ')
)))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if(person){
                res.json(person)
            }
            else{
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${Person.length} people</p><p>${Date()}</p>`)
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(person => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    if (body.content === undefined) {
        return res.status(400).json({ error: 'content missing' })
    }

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, {new: true})
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

/*     if (!body.name){
        return res.status(400).json({
            error: "name missing"
        })
    }
    if (!body.number){
        return res.status(400).json({
            error: "number missing"
        })
    }
    if (persons.map(person => person.name).includes(body.name)){
        return res.status(400).json({
            error: "name must be unique"
        })
    } */

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormatted => res.json(savedAndFormatted))
        .catch(error => next(error))

})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})