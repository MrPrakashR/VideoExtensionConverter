const express = require("express")
const bodyParser = require('body-parser')
const expressFileUpload = require('express-fileupload')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(expressFileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/',
})
)

app.get('/',(req,resp) => {
    resp.sendFile(__dirname+"/index.html")
})

app.post('/convert',(req,resp) => {
    let to = req.body.to
    let file = req.files.file
    let filename = `output.${to}`
    console.log(to)
    console.log(file)

    file.mv('tmp/'+file.name,function (err){ 
       if (err) return resp.sendStatus(500).send(err)
       console.log("File Uploaded Successfully")
    })

    ffmpeg('tmp/'+file.name)
    .withOutputFormat(to)
    .on('end',function (stdout,stderr) {
        console.log("finished")

        resp.download(__dirname+filename,function (err) {
            if (err) throw err

            fs.unlink(__dirname+filename,function (err) {
                if (err) throw err
                console.log("File deleted")
            })

            fs.unlink('tmp/'+file.name,function (err) {
                if (err) throw err
                console.log("File deleted")
            })
        })
    })
    .on('error',function (error) {
        console.log("Error take place",error)
    })
    .saveToFile(__dirname+filename)

})

app.listen(5000,() => {
    console.log("App is Listning on port 5000")
})