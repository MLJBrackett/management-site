//Standard Setup
var express = require("express");
var app = express();
var path = require("path");
let data_service = require("./data-service.js");
let dataServiceAuth = require("./data-service-auth.js");
let fs = require("fs");
let multer = require("multer");
let bodyParser = require('body-parser');
let exphbs = require("express-handlebars");
let clientSessions = require("client-sessions");
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Storage init
//
let storage = multer.diskStorage({
    destination: './public/images/uploaded', filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
let upload = multer({ storage: storage });

//Using handlebars
//
app.engine('.hbs', exphbs({
    extname: ".hbs",
    defaultLayout: 'main',
    helpers: {
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        navLink: function (url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        }
    }
}));

//Setting handlebars
//
app.set("view engine", ".hbs")

//add client session
//
app.use(clientSessions({
    cookieName: 'session',
    secret: 'web322a6',
    duration: 2 * 60 * 1000,
    activeDuration: 1000*60
}));

//Standard session
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

//Standard ensure login
const ensureLogin = (req, res, next) => {
    if (!req.session.user)
        res.redirect('/login');
    else
        next();
}

//Changes the active tab
//
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// setup a 'route' to listen on the default url path (http://localhost)
//
app.get("/", function (req, res) {
    res.render("home")
});

// setup another route to listen on /about
//
app.get("/about", function (req, res) {
    res.render("about")
});

//Query for employees through status, department,manager
//
app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status)
            .then((data) => {
                res.render("employees", { employees: data });
            })
            .catch((err) => {
                res.render("employees", { message: "no results" });
            });
    } else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length > 0) {
                    res.render("employees", { employees: data });
                } else {
                    res.render("employees", { message: "no results" });
                }
            })
            .catch((err) => {
                res.render("employees", { message: "no results" });
            });
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager)
            .then((data) => {
                res.render("employees", { employees: data });
            })
            .catch((err) => {
                res.render({ message: "no results" });
            });
    } else {
        data_service.getAllEmployees()
            .then((data) => {
                if (data.length > 0) { res.render("employees", { employees: data }) }
                else {
                    res.render("employees", { message: "no results" });
                }
            })
            .catch((err) => {
                res.render("employees", { message: "no results" });
            });
    }
});

//Query for employee numbers
//
app.get("/employee/:empNum", ensureLogin, (req, res) => {
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum)
        .then((data) => { viewData.data = data; })
        .catch((err) => { viewData.data = null; })
        .then(data_service.getDepartments)
        .then((data) => {
            viewData.departments = data;
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.data.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => { viewData.departments = []; })
        .then(() => {
            if (viewData.data == null) {
                res.status(404).send("Employee Not Found");
            }
            else {
                res.render("employee", { viewData: viewData })
            }
        });
});

//Get the departments
//
app.get("/departments", ensureLogin, (req, res) => {
    data_service.getDepartments()
        .then((data) => {
            if (data.length > 0) { res.render("departments", { departments: data }) }
            else { res.render("departments", { message: "no results" }) }
        })
        .catch((err) => { res.render("departments", { message: "no results" }) })
});

//app.get for add departments
//
app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment", { title: "Department" })
});

//app.post for add departments
//
app.post("/departments/add", ensureLogin, (req, res) => {
    data_service.addDepartment(req.body)
        .then((data) => { res.redirect("/departments") })
        .catch((err) => { })
});

//Updating a departments name
//
app.post("/department/update", ensureLogin, (req, res) => {
    data_service.updateDepartment(req.body)
        .then((data) => { res.redirect("/departments") })
        .catch((err) => { })
});

//Display a department by the department id (Much like employee by id)
//
app.get("/department/:departmentId", ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId)
        .then((data) => { res.render("department", { departments: data }) })
        .catch((err) => { res.status(404).send("Department Not Found!") })
});

//Delete a department by the department number
//
app.get("/department/delete/:deptNum", ensureLogin, (req, res) => {
    data_service.deleteDepartmentByNum(req.params.deptNum)
        .then((data) => {
            res.redirect("/departments");
        }).catch((err) => {
            res.status(500).send("Unable to Remove Department / Department not found");
        });
});

//Transfer the user to the addEmployee handlebar view
//
app.get("/employees/add", ensureLogin, (req, res) => {
    data_service.getDepartments()
        .then((data) => {
            res.render("addEmployee", { departments: data });
        })
        .catch((err) => {
            res.render("addEmployee", { message: "no results" });
        });
});

//Transfer the user to the addImage handlebar view
//
app.get("/images/add", ensureLogin, (req, res) => {
    res.render("addImage")
});

//upload image file and redirect user to /images
//
app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
    res.redirect("/images");
});

//Read the directory uplaoded images and return in a jpg format 
//
app.get("/images", ensureLogin, (req, res) => {
    var uploadPath = path.join(__dirname, "./public/images/uploaded");
    fs.readdir(uploadPath, function (err, data) {
        res.render("images", { images: data });
    });
});

//Add employee
//
app.post("/employees/add", ensureLogin, (req, res) => {
    data_service.addEmployee(req.body)
        .then((data) => { res.redirect("/employees") })
        .catch((err) => { })
});

//Update employee information
//
app.post("/employee/update", ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body)
        .then((data) => { res.redirect("/employees") })
        .catch((err) => { })
});

//Delete an employee
//
app.get("/employee/delete/:empNum", ensureLogin, (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum)
        .then((data) => { res.redirect("/employees") })
        .catch((err) => { res.status(500).send("Unable to Remove Employee / Employee not found") })
});


app.get("/login", function (req, res) {
    res.render("login")
})

app.get("/register", function (req, res) {
    res.render("register")
})

app.post("/register", function (req, res) {
    dataServiceAuth.registerUser(req.body)
        .then(() => res.render('register', { successMessage: 'User created' }))
        .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
})

app.post("/login", function (req, res) {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,// authenticated user's userName
                email: user.email,// authenticated user's email
                loginHistory: user.loginHistory// authenticated user's loginHistory
            }
            res.redirect('/employees');
        })
        .catch(err => {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
})

app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/")
})

app.get("/userHistory", ensureLogin, function (req, res) {
    res.render("userHistory")
})

//Incorrect routeing
//
app.use(function (req, res) {
    res.status(404).send("Incorrect Route, ERROR 404");
})

//On server start do these
//
data_service.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
});