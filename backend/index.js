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