const express = require('express');
const bodyParser= require('body-parser') 
const path = require('path');
const routes = require('./controllers/routes.js');


const app = express();

// Set the folder for the views
app.set('views', path.join(__dirname, './views/ejs'));

// Set the folder for css, java scripts and images
app.use(express.static(path.join(__dirname,'./public/css')));
app.use(express.static(path.join(__dirname, './public/assets/images')));
app.use(express.static(path.join(__dirname, './public/javascripts')));


app.use(express.json());
app.use(bodyParser.json());

// Set the view engine to ejs
app.set('view engine', 'ejs');


myPort = process.env.PORT || 3000;

const run = async () => {
  
  app.use('/', routes); 

  //starts server
  await app.listen(myPort, () => {
    console.log(`Server is running at ${myPort}`)
  });
}

run()