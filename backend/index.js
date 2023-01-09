// don't render the views in the backend-files!
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
require('dotenv').config()

const multer = require('multer')
const upload = multer()

const app = express()

const entriesData = require('./entries.json')
const alltoken = require('./p.json')

const { title, exit, nextTick, ppid } = require('process')
const { parse } = require('path')

console.log('General setup')
app.use(cors())

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

console.log('Adding routes')
app.get('/api-status', (req, res) => {
    // Request implementation
    res.send('If you see this, express server is working fine :)')
})

// protected route
// jwt-token-name to check author.name
// Check to make sure header is not undefined, if so, return Forbidden (403)
function verifyJWT(req, res, next) {
	const token = req.headers['authorization'];
	if (!token) {
	  return res.status(401).send({ message: 'No token provided.' });
	}
	jwt.verify(token, process.env.SECRET, (err, decoded) => {
	  if (err) {
		return res.status(401).send({ message: 'Invalid token.' });
	  }
	  req.user = decoded.user;
	  next();
	});
  }

app.post('/login/verify', (req, res) => {
    const token = req.headers['authorization']
    if (!token) return res.sendStatus(400)
    jwt.verify(token, process.env.secretValueFromENV, (err, decoded) => {
        if (err) {
            console.log(`Error: `, err)
            return res.sendStatus(403)
        }
        console.log(`decoded: `, decoded)
        return res.send(decoded)
    })
})

app.post('/login', (req, res) => {
	// check if req.body.password is in the p.json-file
	//const password = alltoken.praxis.find(password => alltoken.praxis.password = req.body.password)
	const password = req.body.password
	console.log(`sent password: `, password)
    for (let i = 0; i < alltoken.praxis.length; i++) {
        if (password == alltoken.praxis[i].password) {
			console.log(`p.json password: `, alltoken.praxis[i].password)
            // send the token to the frontend
            const objectToSign = {
			//	password: alltoken.praxis[i].password,
                id: alltoken.praxis[i].id,
                name: alltoken.praxis[i].authorName
            }
            const token = jwt.sign(objectToSign, process.env.secretValueFromENV)
			console.log(`token: `, token)
			console.log('/login-route triggered!')
			// send the token with property token to the frontend
            return res.send({ token })
		}
	}
	res.send('Incorrect password')
})

app.get('/posts', (req, res) => {
    console.log("'/posts'-route triggered! ")
    // send posts to frontend for displaying them                                                                                    
    res.send(entriesData.posts)  
})
// get a specific post
app.get('/posts/:id', (req, res) => {
    const id = req.params.id
    const allPosts = entriesData.posts
    // a for loop that finds one post
    let reqPost = ""
        for(let post of allPosts) {
            console.log(`pid: `, id, `post: `, post)
            if(post.id == id) {
                reqPost = allPosts[post.id]
            }
        }
        console.log(`reqPost: `, reqPost)
        res.send(reqPost)
		console.log("'/posts/:id'-route triggered!")
})
// get a specific post
/* app.get('/posts/:id', (req, res) => {
	const post = entriesData.posts.find((entry) => entry.id === req.params.id)
	if(post) {
		res.send({ post })
	} else {
		res.status(404).send({ error: 'Post not found' })
	}
    console.log("'/posts/:id'-route triggered!")
})*/
// Get comments for a specific post
app.get('/comments/:postId', (req, res) => {
    const pid = req.params.postId
    const allComments = entriesData.comments
    let postComments = []

    for(let i = 0; i < allComments.length; i++){
        if(pid == allComments[i].postId) {
            console.log(`I will add: `, allComments[i])
            postComments.push(allComments[i])
        }
      }
        console.log(`Comments: `, postComments)
        res.send(postComments)
        console.log("'/comments/:postId'-route triggered!")
})

app.post('/posts', (req, res) => {
	const author = req.body.author // for the middeleware function "verifyJWT"
	// receive the new post from the frontend
	const newPost = req.body
	console.log(`newPost: `, newPost)
	// check if json-file not exists
	if (!fs.existsSync('./entries.json')) {
		// create new file if not exists
		fs.closeSync(fs.openSync('./entries.json', 'w'))
	}
		//check if entriesData file is empty
		if (entriesData.posts.length == 0) {
			// if empty, set id to 1
			newPost.id = 1
		}
		else {
			// if not empty, set id to the last id + 1
			newPost.id = entriesData.posts[entriesData.posts.length - 1].id + 1
		}
		// add the new post to the json-file
		entriesData.posts.push(newPost)
		// append the new post to the json-file
		fs.writeFileSync('./entries.json', JSON.stringify(entriesData))
		
	// send the new post to the frontend
	console.log("'/post'-route triggered!")
    return res.send({ post: newPost })
})

// add a comment for a post
app.post('/comments', (req, res) => {
	// receive the new comment from the frontend
	const newComment = req.body

    console.log(`newComment: `, newComment)
    // check if json-file not exists
	if (!fs.existsSync('./entries.json')) {
		// create new file if not exists
		fs.closeSync(fs.openSync('./entries.json', 'w'))
	}
		//check if entriesData file is empty
		if (entriesData.comments.length == 0) {
			// if empty, set id to 1
			newComment.id = 1
		}
		else {
			// if not empty, set id to the last id + 1
			newComment.id = entriesData.comments[entriesData.comments.length - 1].id + 1
		}
		// if the newComment postId is not a number convert it to a number
		if (typeof newComment.postId === 'string') {
			newComment.postId = parseInt(newComment.postId)
		}
		// add the new comment to the json-file
		entriesData.comments.push(newComment)
		// append the new comment to the json-file
		fs.writeFileSync('./entries.json', JSON.stringify(entriesData))
		
	// send the new comment to the frontend
	console.log("'/comments'-route triggered!")
    res.send(newComment)
})

app.post('/upload', upload.single('file'), (req, res) => {
	console.log('/upload-route triggered!')
	// Check if the request includes a file
	if (!req.file) {
	  return res.status(400).send('No files were uploaded.')
	}
  
	// Get the file from the request
	const file = req.file
	const fileName = req.file.name
	const author = req.body.author
console.log(`file: `, file, `fileName: `, fileName, `author: `, author)
	// if the author folder does not exist, create it
	if (!fs.existsSync(`./backend/${author}`) && author != "") {
		console.log(`./backend/${author}`)
		fs.mkdirSync(`./backend/${author}`)
	}
	
	// move the file to the author folder
	fs.mv(file.path, `./backend/${author}`, (err) => {
	  if (err) {
		return res.status(500).send(err)
	  }
  
	  // Return a success response
	  return res.send(`File ${fileName} uploaded!`)
	})
  })
  
console.log('Starting the server')
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})

/*app.post('/authors', (req, res) => {
	const author = {authorName: req.body.authorName, password: req.body.password}
		// check if json-file not exists
		if (!fs.existsSync('./p.json')) {
			// create new file if not exists
			fs.closeSync(fs.openSync('./p.json', 'w'))
		}
			//check if alltoken file is empty
			if (alltoken.praxis.length == 0) {
				// if empty, set id to 1
				author.id = 1
			}
			else {
				// if not empty, set id to the last id + 1
				author.id = alltoken.praxis[alltoken.praxis.length - 1].id + 1
			}
	// add to p.json
	alltoken.praxis.push(author)
	fs.writeFileSync('./p.json', JSON.stringify(alltoken))
	res.send('Author added!')

	const token = req.headers['token']
	if (!token) return res.sendStatus(400)
	jwt.verify(token, secretValueFromENV, (err, decoded) => {
		if (err) {
			console.log(`Error: `, err)
			return res.sendStatus(403)
		}
		console.log(`decoded: `, decoded)
		return res.send(decoded)
	})

})*/