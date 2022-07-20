var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/assignment2',  function () {
    console.log('mongodb connected')
});

module.exports = mongoose;