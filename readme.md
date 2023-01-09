# TODO:
## Tuesday, 13th:
- [X] add a new comment for post
- [X] local storage: author name
- [X] research for jwt / .md syntax
- [X] create a login screen
## Tuesday, 20th:
- [X] check the provided token and save it to local storage
- [X] if token is right, redirect to main screen
- [ ] write a middleware to be able to just write a post when logged in. jwt-token-name to check author.name
## without date:
- [ ] payload images or other type of files maybe
- [ ] Mongo
- [ ] Data analyzation from our sources
- [ ] p.json data: get the token and console.log it("Praxis": praxisName, "token": token)

# Blog
## User can do
- see the posts
- see one post and comments to it
- add a new comment to a post anonimously
- (s) add a new comment to a post with author name
- (s) add a new post
- login with a token issued by us

## Screens
- login screen (optional for users)
- post list
- post detail
- new post

## Endpoints
### Login screen
- POST /login. Headers: {Auth: Token}
- GET /login/verify. Headers: {Auth: Token}
### Post list
- GET /posts
### Post detail
- GET /posts/:id
- GET /comments?postId=:id
- POST /comment. Body: {postId: id, text: text}. Headers: {Auth: Token} (optional)
### New post
- POST /posts. Body: {title: title, text: text}. Headers: {Auth: Token}


