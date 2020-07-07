const Sequelize = require('sequelize');

let Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

let Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then((Employee) => {
            resolve();
        })
            .then((Department) => {
                resolve();
            })
            .catch((err) => {
                reject("unable to sync the database");
        });
    });
}

module.exports.getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll());
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getEmployeesByStatus = (status) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({ where: { status: status } }));
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getEmployeesByDepartment = (department) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({ where: { department: department } }));
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getEmployeesByManager = (manager) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({ where: { employeeManagerNum: manager } }));
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getEmployeeByNum = (num) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({ where: { employeeNum: num } }));
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getDepartments = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.findAll());
        })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let x in employeeData) {
                if (employeeData[x] == "")
                    employeeData[x] = null;
            }
            resolve(Employee.create({
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                isManager: employeeData.isManager,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            }));
        }).catch(() => {
            reject("unable to create employee.");
        });
    }).catch(() => {
        reject("unable to create employee.");
    });
}

module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let x in employeeData) {
                if (employeeData[x] == "")
                    employeeData[x] = null;
            }
            resolve(Employee.update({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressPostal: employeeData.addressPostal,
                addressState: employeeData.addressPostal,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department
            }, { where: { employeeNum: employeeData.employeeNum } }));
        }).catch(() => {
            reject("unable to update employee.");
        });
    });
}


module.exports.addDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let i in departmentData) {
                if (departmentData[i] == "")
                    departmentData[i] = null;
            }
            resolve(Department.create({
                departmentId: departmentData.departmentId,
                departmentName: departmentData.departmentName
            }));
        }).catch(() => {
            reject("unable to create department");
        });
    }).catch(() => {
        reject("unable to create department.");
    });
}

module.exports.updateDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let i in departmentData) {
                if (departmentData[i] == "")
                    departmentData[i] = null;
            }
            resolve(Department.update({
                departmentName: departmentData.departmentName,
            }, { where: { departmentId: departmentData.departmentId } }));
        }).catch(() => {
            reject("unable to update department.")
        });
    });
}

module.exports.getDepartmentById = (id) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.findAll({ where: { departmentId: id } }));
        }).catch((err) => {
            reject("unable to find department");
        });
    });
}

module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.destroy({
                where: { employeeNum: empNum }
            }));
        }).catch((err) => {
            reject();
        });
    });
}

module.exports.deleteDepartmentByNum = (DeptNum) =>{
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            resolve(Department.destroy({
                where:{ departmentId : DeptNum }
            }));
        })
        .catch((err) => {
            reject();
        });
    });
}