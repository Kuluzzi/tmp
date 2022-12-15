// don't render the views in the backend-files!
// 

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser') 
require('dotenv').config()

const app = express()

// access to the fs and the json-file in this case
const fs = require('fs')
const entriesData = require('./entries.json');
const alltoken = require('./p.json');
const { title, exit, nextTick, ppid } = require('process');
const { parse } = require('path');

console.log('General setup');
app.use(cors())

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('Adding routes')
app.get('/api-status', (req, res) => {
    // Request implementation
    res.send('If you see this, express server is working fine :)')
})

app.get('/posts', (req, res) => {
    console.log("'/posts'-route triggered! ")
    // console.log(entriesData.posts)

    // send posts to frontend for displaying them                                                                                    
    res.send(entriesData.posts)  
})

app.get('/posts/:id', (req, res) => {
    const id = req.params.id
    const allPosts = entriesData.posts
    //const post = entriesData.posts.find(post => req.params.id)
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
    //res.json({ data: entriesData.posts.find((post) => post.id === req.params.id) })
    console.log("'/posts/:id'-route triggered!")
})

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

app.post('/login/verify', (req, res) => {
    const token = req.body.token
    if (!token) return res.sendStatus(400)
    jwt.verify(token, secretValueFromENV, (err, decoded) => {
        if (err) {
            console.log(`Error: `, err)
            return res.sendStatus(403)
        }
        console.log(`decoded: `, decoded)
        return res.send(decoded)
    })
})

app.post('/login', (req, res) => {
    const password = req.body.password
    for (let i = 0; i < alltoken.praxis.length; i++) {
        if (password == alltoken.praxis[i].password) {
            // send the token to the frontend
            const objectToSign = {
                id: alltoken.praxis[i].id,
                name: alltoken.praxis[i].praxisName
            }
            const token = jwt.sign(objectToSign, secretValueFromENV)
            return res.send({ token })
        }
    }
    res.send('Pass is incorrect!')
})
// middleware to be able to just write a post when logged in
// write a route for logging in
app.post('/login', (req, res) => {
	// receive the login-data from the frontend
	const loginData = req.body
	console.log(`loginData: `, loginData)
	// check if json-file not exists
	if (!fs.existsSync('./p.json')) {
		// create new file if not exists
		fs.closeSync(fs.openSync('./p.json', 'w'))
	}
		//check if password is valid with alltoken file
		if (loginData.password == alltoken.password) {
			// if password is valid, send a token to the frontend
			res.send
			({
				token:
				{
					//name: loginData.name,
					password: loginData.password
				}
			})
		}
		else {
			// if password is not valid, send a message to the frontend
			res.send
			({
				message: "Wrong password"
			})
		}
})

// middleware to be able to just write a post when logged in
// check if the token is valid
const checkToken = (req, res, next) => {
	// get the token from the frontend
	const token = req.body.token
	console.log(`token: `, token)
	// check if the token is valid
	if (token == alltoken.password) {
		// if token is valid, go to the next middleware
		next()
	}
	else {
		// if token is not valid, send a message to the frontend
		res.send
		({
			message: "Wrong token"
		})
	}
}

//Check to make sure header is not undefined, if so, return Forbidden (403)
const checkJwt = (req, res, next) => {
    const header = req.headers['authorization'];

    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
}

// write a route for writing a post
app.post('/writePost', checkToken, (req, res) => {
	// receive the post-data from the frontend
	const postData = req.body
	console.log(`postData: `, postData)
	// check if json-file not exists
	if (!fs.existsSync('./entries.json')) {
		// create new file if not exists
		fs.closeSync(fs.openSync('./entries.json', 'w'))
	}
	// read the json-file
	const data = fs.readFileSync('./entries.json')
	// parse the json-file
	const json = JSON.parse(data)
	// add the new post to the json-file
	json.posts.push(postData)
	// write the json-file
	fs.writeFileSync('./entries.json', JSON.stringify(json))
	// send a message to the frontend
	res.send
	({
		message: "Post added"
	})
})

/*
// check for the sent password in the json-file
app.post('/post', (req, res, next) => {
	const { body } = req;
	const { password } = body;

	//checking to make sure the user entered the correct password combo
	if(password === user.password) { 
		//if user log in success, generate a JWT token for the user with a secret key
		jwt.sign({user}, 'privatekey', { },(err, token) => {
			if(err) { console.log(err) }    
			res.send(token);
		});
	} else {
		console.log('ERROR: Could not log in');
	}
})*/

// protected route
// jwt-token-name to check author.name

app.get('/posts', checkJwt, (req, res) => {
	//verify the JWT token generated for the user
	jwt.verify(req.token, 'privatekey', (err, authorizedData) => {
		if(err){
			//If error send Forbidden (403)
			console.log('ERROR: Could not connect to the protected route');
			res.sendStatus(403);
		} else {
			//If token is successfully verified, we can send the autorized data 
			res.json({
				message: 'Successful log in',
				authorizedData
			});
			console.log('SUCCESS: Connected to protected route');
		}
	})
});

// jwt-token-password to check author.password

// write a route for adding a post

app.post('/post', (req, res) => {
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
    res.sendStatus(200, `Post added by ${newPost.author}`)
})
// write a route for adding a comment for a post
app.post('/comment', (req, res) => {
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
	console.log("'/comment'-route triggered!")
    res.sendStatus(200, `Comment added for postID ${newComment.postId}.`)
})
app.get('/login', (req, res) => {
	console.log("'/login' get-route triggered!")
	res.send(`Login page`)
})
app.post('/login', (req, res) => {
	// check if the password sent from the frontend is similar to the password in the p.json file
	const password = req.body.password
	console.log(`/login post-route triggered!`)
	// iterate through the p.json file
	for(let i = 0; i < alltoken.length; i++){
		// if the password is correct
		if(password == alltoken[i].password) {
			// send the token to the frontend
			res.sendStatus(200, `Password: ${password} is correct!`)
		}
		// if the password is incorrect send alert message to the frontend
		else {
			// send alert
			res.send((alert(`Password: ${password} is incorrect!`)))
		}
	}
})
console.log('Starting the server')
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})