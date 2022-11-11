const express = require('express');
const stompit = require('stompit')
const date = require('date-and-time')
const app = express();
const {Pool,Client} = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@192.168.209.101:5432/myedgedb',
})
const port = process.env.PORT || 8484;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

app.get('/', function(req, res){
  const now  =  new Date();
  const timestampvalue = date.format(now,'YYYY-MM-DD HH:mm:ss');
    res.send('Hello world from Local Edge server : TimeStamp :'+ timestampvalue);
  });// sample get


  app.post('/api/datasend', function async(req, res) {
    console.log(req.body)
    var username = req.body.username;
    var myapp = req.body.myapp;
    var duration = req.body.duration;

    // Importing module
//const date = require('date-and-time')
  
// Creating object of current date and time 
// by using Date() 
const now  =  new Date();
  
// Formatting the date and time
// by using date.format() method
const timestampvalue = date.format(now,'YYYY-MM-DD HH:mm:ss');
  
// Display the result
console.log("current date and time : " + timestampvalue)

     stompit.connect({ host: '192.168.209.101', port: 61613 }, async (err, sclient) => {
      frame = sclient.send({ destination: 'LocalToInternet' })
     
      await frame.write(username+','+myapp+','+timestampvalue+','+duration);
     
      await frame.end()
     
      sclient.disconnect()
    })
  
    res.send({
      'result':"send to amq ok"
    });
  });

  app.post('/api/myaccess', function async(req, res) {
    console.log(req.body)
    console.log("Inside Myaccess : " );
    var myaccessresult = "error";

    

       stompit.connect({ host: '192.168.209.101', port: 61613 }, async (err, sclient) => {
        frame = sclient.send({ destination: 'LocalToInternetAccess' })
      
        await frame.write("checklimit");
      
        await frame.end()
      
        sclient.disconnect()
        })// sclient stompit

        stompit.connect({ host: '192.168.209.101', port: 61613 }, async(err, rclient) => {
    
         await rclient.subscribe({ destination: 'InternetToLocalAccess' }, async(err, msg) => {
            
          await msg.readString('UTF-8', async(err, body) => {
      
              await  setTimeout(function() {
                  console.log('This printed after about 5 second :' + body);
                  myaccessresult = body;
                  res.send({
                    'result':myaccessresult
                  });
                  
                }, 10000);
            //console.log(body)
            
          })

          await rclient.disconnect()
         
          
      
        })
        
      
        })//rclient stompit
        
  
       
  });//api post myaccess
  

app.listen(port);
console.log('Server started at http://localhost:' + port);