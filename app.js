let express = require ('express');
let bodyParser = require('body-parser');
let app = express();
let fs = require ('fs');
let fileUpload = require('express-fileupload');

// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');
app.use ('/assets', express.static('assets'));
app.use(fileUpload());


app.get ('/', function(req, res){
    res.render('index');
});

app.get ('/post_form', function(req, res){
    // console.log(req.query);
    res.render('post_form', {forminput:req.query});
});

/* Gets the comment posted from comment_form  in single_blog page*/ 
app.get ('/single_blog', function(req, res){
    // console.log(req.query);
    res.render('single_blog', {comment_form:req.query});
    // console.log(single_blog);
});

/** Reads the blog from the json file "blogstore.json" where the posts posted using the form in "posted_form" are saved */
app.get("/blogs",function(req,res) {
    fs.readFile("./blogstore.json", "utf8", function(err, data){
        if(err) throw err;
    
        let resultArray = JSON.parse(data).blogs; //do operation on data that generates say resultArray;
    
        /*  Renders all the blog into the frontend - into the blogs.ejs file */
        res.render('blogs', {data:resultArray});
    });
});

// Get the single page blog for each. 
app.get("/blogs/:single_blog", (req, res) => {
    fs.exists("blogstore.json", function(exists) {
        let obj = {blogs: []};//{blogs:[]};
        let obj2 = {comments: []};
        let blogID = ""
        if (exists) {
            const data = fs.readFileSync("blogstore.json","utf-8");
            const json = JSON.parse(data);
            for (let i = 0; i < json.blogs.length; i++) {
                if (req.params.single_blog  == json.blogs[i].id) {
                    //obj.blogs = [...obj.blogs, json.blogs[i]];
                    obj.blogs = json.blogs[i];
                    blogID = json.blogs[i].id
                    // console.log(obj);
                    break;
                    // console.log(obj);
                }
            }         
            const data2 = fs.readFileSync("commentstore.json","utf-8");
            let obj3 = JSON.parse(data2);
            for (let i = 0; i < obj3.comments.length; i++) {
                if ( obj3.comments[i].blog_id.trim() === blogID.trim()) {
                    obj2.comments = [...obj2.comments, obj3.comments[i]]
                }   
            }  
            console.log(obj);
            console.log(obj2);

            res.render('single_blog', {
                blog: obj.blogs,
                comments: obj2.comments
            });
        } else {
            // res.render('(single_blog', {blog:obj,comments:obj2.comments});
            // console.log(blog.title);
        }
    });
});


// the posted blogs posted from the post_form.ejs ( step -1) is handled here 

app.post ('/post_form', urlencodedParser, function(req, res){
    // renders the posted data to blogs page
    let tempdata = (req.body);
    // console.log(req.files);

    const jsonData = fs.readFileSync("./blogstore.json","utf-8");
    let jsonObj = JSON.parse(jsonData);
    tempdata.id = new Date();
    tempdata.date = new Date();
     // console.log(tempdata);
    const blogs = [...jsonObj.blogs,tempdata];
    jsonObj.blogs = blogs;
    let jsonStringified = JSON.stringify(jsonObj, null, 2);
    // console.log(jsonStringified)
    fs.writeFile('blogstore.json', jsonStringified, (err) =>{
        if(err) throw err;
        console.log('data written to file');
    });
  
    res.redirect("/blogs");
});

/*  All the comments posted from the "single_blog.ejs" comment form are handled here  */

app.post ('/comment_form', urlencodedParser, function(req, res){
    // renders the posted data to blogs page
    let temp_comments = (req.body);
    // console.log(temp_comments);
    const jsonData = fs.readFileSync("./commentstore.json","utf-8");
    let jsonObj = JSON.parse(jsonData);
    temp_comments.comment_id = new Date();
    // temp_comments.id = new Date();  ?????????
    // console.log(jsonObj)
    const comments = [...jsonObj.comments,temp_comments];
    jsonObj.comments = comments;
    let CommentsJsonStringified = JSON.stringify(jsonObj, null, 2);
    // console.log(CommentsJsonStringified);
    fs.writeFile('commentstore.json', CommentsJsonStringified, (err) =>{
        if(err) throw err;
        console.log('data written to file');
    });
    res.redirect("/blogs");
});

// /*  Now we are trying to get the comments from the commentstore.json file
// **/
// app.get("/comments",(req,res) => {
//     fs.exists("commentstore.json", function(exists) {
//         if (exists) {
//             let comment_data = fs.readFileSync("commentstore.json","utf-8");
//              console.log("Hello there ");
//             res.send(comment_data);

//         } else {
//             let obj = {comments:[]};
//             res.send(obj);
//         }
//     });
// });

// loading only the article specific comments
// app.get("/comments/:single_blog", (req, res) => {
//     fs.exists("commentstore.json", function(exists) {
//         let obj = {comments:[]}; 
//         console.log("Hello there ");
//         if (exists) {
//             let data = fs.readFileSync("commentstore.json","utf-8");
//             console.log(data);
//             let json = JSON.parse(data);
//             // console.log(json);
//             for(let i = 0; i < json.comments.length; i++) {
//                 if (req.params.single_blog == json.comments[i].blog_id) {
//                     obj.comments = [...obj.comments, json.comments[i]];
//                 }
//             }
//                 res.render('single_blog', {comments:obj.comments});
//                //  console.log(comments);
//         }   else {
//                 res.render('single_blog', {comments:obj.comments});
//                 // console.log(comment.commentor_name);
//             }
//     })
// })

// Listen
app.listen(3000, () => {
    console.log('Server listing on 3000');
});