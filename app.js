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

app.use(express.static(__dirname + '/public'));

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
    console.log(single_blog);
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
app.get("/blogs/:single_blog", (req, res, next) => {
    fs.exists("blogstore.json", function(exists) {
        let obj = {};//{blogs:[]};
        if (exists) {
            const data = fs.readFileSync("blogstore.json","utf-8");
            const json = JSON.parse(data);
            for (let i = 0; i < json.blogs.length; i++) {
                if (req.params.single_blog  == json.blogs[i].id) {
                    //obj.blogs = [...obj.blogs, json.blogs[i]];
                    obj = json.blogs[i];
                }
            }
            // console.log(obj);
            res.render('single_blog', {blog:obj});
            next();
        } else {
            res.render('(single_blog', {blog:obj});
            // console.log(blog.title);
            next();
        }
    });
});

/*  All the comments posted from the "single_blog.ejs" comment form are handled here  */

app.post ('/single_blog', urlencodedParser, function(req, res){
    // renders the posted data to blogs page
    let temp_comments = (req.body);
    const jsonData = fs.readFileSync("./commentstore.json","utf-8");
    let jsonObj = JSON.parse(jsonData);
    // temp_comments.id = new Date();  ?????????
    // console.log(jsonObj)
    const comments = [...jsonObj.blogs,temp_comments];
    jsonObj.comments = comments;
    let CommentsJsonStringified = JSON.stringify(jsonObj, null, 2);
    // console.log(jsonStringified)
    fs.writeFile('commentstore.json', CommentsJsonStringified, (err) =>{
        if(err) throw err;
        console.log('data written to file');
    });
  
    res.redirect("/blogs");
});


// the posted blogs posted from the post_form.ejs is handled here 

app.post ('/post_form', urlencodedParser, function(req, res){
    // renders the posted data to blogs page
    let tempdata = (req.body);
    console.log(req.files);

    const jsonData = fs.readFileSync("./blogstore.json","utf-8");
    let jsonObj = JSON.parse(jsonData);
    tempdata.id = new Date();
    // console.log(jsonObj)
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


// Listen
app.listen(3000, () => {
    // console.log('Server listing on 3000');
});