const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}
  
const password = process.argv[2]

const url =
  `mongodb+srv://pohjolpa:${password}@cluster0.frrns.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = new mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(res => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    Person.find({}).then(res => {
        console.log('Phonebook: ')
        res.forEach(person => {
            console.log(person.name + ' ' + person.number)
        })
        mongoose.connection.close()
    })
}