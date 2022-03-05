const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log(`Connected to the employee_db database.`)
);

// function to view all departments in a table in the console
function viewDepts() {
  const sql = 'SELECT id, dept_name AS department FROM department ORDER BY id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

// function to view all roles in a table in the console
function viewRoles() {
  const sql =
    'SELECT emp_role.id AS id, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary FROM emp_role JOIN department ON emp_role.department_id = department.id ORDER BY emp_role.id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

// function to view all employees in a table in the console
function viewEmpls() {
  const sql =
    'SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id ORDER BY employee1.id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

// function to add a new department to the database
function addDept() {
  inquirer
    .prompt({
      type: 'input',
      name: 'department',
      message: 'What is the name of the department',
    })
    .then((data) => {
      const sql = `INSERT INTO department(dept_name) VALUES (?)`;
      const param = [data.department];

      db.query(sql, param, (err, results) => {
        if (err) {
          throw err;
        }

        menuQ();
      });
    });
}

// function to add a new role to database
function addRole() {
  var deptChoices = [];
  db.query(`SELECT dept_name FROM department;`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      deptChoices.push(data[i].dept_name);
    }
  });

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'role',
        message: 'What is the name of the role?',
      },
      {
        type: 'number',
        name: 'salary',
        message: 'What is the salary for this role?',
      },
      {
        type: 'list',
        name: 'deptOfRole',
        message: 'What department does the role belong to?',
        choices: deptChoices,
      },
    ])
    .then((data) => {
      const sql = `INSERT INTO emp_role(title, salary, department_id) VALUES (?, ?, ?)`;
      const dept = deptChoices.indexOf(data.deptOfRole) + 1;
      const param = [data.role, data.salary, dept];

      db.query(sql, param, (err, results) => {
        if (err) {
          throw err;
        }
        console.log(data.role + ' added to database');

        menuQ();
      });
    });
}

//function to add a new employee
function addEmpl() {
  var roleChoices = [];
  db.query(`SELECT title FROM emp_role;`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      roleChoices.push(data[i].title);
    }
  });
  var managerChoices = [];
  db.query(
    `SELECT CONCAT(first_name, " ", last_name) AS name FROM employee;`,
    function (err, data) {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        managerChoices.push(data[i].name);
      }
    }
  );

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "What is the employee's first name?",
      },
      {
        type: 'input',
        name: 'last_name',
        message: "What is the employee's last name?",
      },
      {
        type: 'list',
        name: 'empRole',
        message: "What is the employee's role?",
        choices: roleChoices,
      },
      {
        type: 'list',
        name: 'manager',
        message: 'Does this person have a manager?',
        choices: ['Yes', 'No'],
      },
      {
        type: 'list',
        name: 'empManager',
        message: "Who is the employee's manager?",
        choices: managerChoices,
        when(answers) {
          return answers.manager === 'Yes';
        },
      },
    ])
    .then((data) => {
      const sql = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
      const role = roleChoices.indexOf(data.empRole) + 1;
      const manager = managerChoices.indexOf(data.empManager) + 1;
      const param = [data.first_name, data.last_name, role, manager];

      db.query(sql, param, (err, results) => {
        if (err) {
          throw err;
        }
        console.log(
          data.first_name + ' ' + data.last_name + ' added to database'
        );

        menuQ();
      });
    });
}

// function that allows for employees role to be changed by selecting which employee to change the role for, and the new role they have
function updateEmpl() {
  var emplChoices = [];
  var roleChoices = [];
  db.promise()
    .query(`SELECT CONCAT(first_name, " ", last_name) AS name FROM employee;`)
    .then(function ([employees]) {
      for (var i = 0; i < employees.length; i++) {
        emplChoices.push(employees[i].name);
      }
      return db.promise().query(`SELECT title FROM emp_role;`);
    })
    .then(function ([roles]) {
      for (var i = 0; i < roles.length; i++) {
        roleChoices.push(roles[i].title);
      }
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'empUpdate',
            message: 'Which employees role will you update?',
            choices: emplChoices,
          },
          {
            type: 'list',
            name: 'empRoles',
            message: 'What is their new role?',
            choices: roleChoices,
          },
        ])
        .then((data) => {
          const sql = `UPDATE employee SET role_id = (?) WHERE id = (?);`;
          const empl = emplChoices.indexOf(data.empUpdate) + 1;
          const roleC = roleChoices.indexOf(data.empRoles) + 1;
          const param = [roleC, empl];

          db.promise()
            .query(sql, param)
            .then(
              console.log(
                data.empUpdate + ' role has been changed to ' + data.empRoles
              )
            );

          menuQ();
        });
    });
}

function viewEmpByMan() {
  var manChoice = [];
  db.promise()
    .query(`SELECT concat(first_name, " ", last_name) AS name FROM employee;`)
    .then(function ([manager]) {
      for (var i = 0; i < manager.length; i++) {
        manChoice.push(manager[i].name);
      }
      inquirer
        .prompt({
          type: 'list',
          name: 'mangView',
          message: 'Which manager do you want to view employees for?',
          choices: manChoice,
        })
        .then((data) => {
          const sql = `SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id WHERE employee1.manager_id = (?)`;
          const param = manChoice.indexOf(data.mangView) + 1;
          db.query(sql, param, function (err, res) {
            if (res) {
              console.table(res);
              menuQ();
            }
          });
        });
    });
}

// function to view all the employees for a specific department. User is prompted to select a department and then all employees for that
// department will be shown in a table along with their title
function viewEmpByDept() {
  var deptEmp = [];
  db.promise()
    .query(`SELECT dept_name AS department FROM department;`)
    .then(function ([department]) {
      for (var i = 0; i < department.length; i++) {
        deptEmp.push(department[i].department);
      }
      inquirer
        .prompt({
          type: 'list',
          name: 'deptView',
          message: 'Which department do you want to view the employees for?',
          choices: deptEmp,
        })
        .then((data) => {
          const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, emp_role.title AS title, department.dept_name AS department FROM employee JOIN emp_role ON employee.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id WHERE department.id = (?);`;
          const param = deptEmp.indexOf(data.deptView) + 1;

          db.query(sql, param, function (err, res) {
            console.table(res);
            menuQ();
          });
        });
    });
}

// function that allows you to update an employees manager. First the employee is selected, then the manager with both selections creating an array
// from here a query is run to change the manager id for that employee
function updateManager() {
  var emplChoices = [];
  var managerChoices = [];
  db.promise()
    .query(`SELECT CONCAT(first_name, " ", last_name) AS name FROM employee;`)
    .then(function ([employees]) {
      for (var i = 0; i < employees.length; i++) {
        emplChoices.push(employees[i].name);
      }
      return db
        .promise()
        .query(
          `SELECT CONCAT(first_name, " ", last_name) as manager FROM employee;`
        );
    })
    .then(function ([manager]) {
      for (var i = 0; i < manager.length; i++) {
        managerChoices.push(manager[i].manager);
      }
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'emplUpdate',
            message: 'Which employees do you want to update?',
            choices: emplChoices,
          },
          {
            type: 'list',
            name: 'emplManager',
            message: 'Who is their new manager?',
            choices: managerChoices,
          },
        ])
        .then((data) => {
          const sql = `UPDATE employee SET manager_id = (?) WHERE id = (?);`;
          const empl = emplChoices.indexOf(data.emplUpdate) + 1;
          const mgr = managerChoices.indexOf(data.emplManager) + 1;
          const param = [mgr, empl];

          db.promise()
            .query(sql, param)
            .then(
              console.log(
                data.emplUpdate +
                  ' manager has been changed to ' +
                  data.emplManager
              )
            );

          menuQ();
        });
    });
}

// function to select a department from the database and then sums the utilized budget for that department based on salaries of all employees in department
function viewBudget() {
  const sql =
    'SELECT SUM(emp_role.salary) AS utilized_budget, department.dept_name AS department FROM emp_role JOIN department ON emp_role.department_id = department.id GROUP BY department_id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

// function that prompts if user wants to delete a department, role, or employee and then based on that option
// asks which item from the selected option is to be deleted and deletes it from the database
function delOption() {
  var deptChoice = [];
  db.query(`SELECT dept_name FROM department;`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      deptChoice.push(data[i].dept_name);
    }
  });
  var roleChoice = [];
  db.query(`SELECT title FROM emp_role;`, function (err, data) {
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
      roleChoice.push(data[i].title);
    }
  });
  var empChoice = [];
  db.query(
    `SELECT CONCAT(first_name, " ", last_name) AS name FROM employee;`,
    function (err, data) {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        empChoice.push(data[i].name);
      }
    }
  );
  inquirer
    .prompt({
      type: 'list',
      name: 'delete',
      message: 'What do you want to delete?',
      choices: ['Department', 'Role', 'Employee'],
    })
    .then((data) => {
      switch (data.delete) {
        case 'Department':
          return inquirer
            .prompt([
              {
                type: 'list',
                name: 'delDept',
                message: 'What department do you want to delete',
                choices: deptChoice,
              },
            ])
            .then((data) => {
              const sql = `DELETE FROM department WHERE id = (?);`;

              const param = deptChoice.indexOf(data.delDept) + 1;

              db.query(sql, param, (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(data.delDept + ' has been deleted from database');

                menuQ();
              });
            });
        case 'Role':
          return inquirer
            .prompt([
              {
                type: 'list',
                name: 'delRole',
                message: 'What role do you want to delete',
                choices: roleChoice,
              },
            ])
            .then((data) => {
              const sql = `DELETE FROM emp_role WHERE id = (?);`;

              const param = roleChoice.indexOf(data.delRole) + 1;

              db.query(sql, param, (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(data.delRole + ' has been deleted from database');

                menuQ();
              });
            });
        case 'Employee':
          return inquirer
            .prompt([
              {
                type: 'list',
                name: 'delEmp',
                message: 'What role do you want to delete',
                choices: empChoice,
              },
            ])
            .then((data) => {
              const sql = `DELETE FROM employee WHERE id = (?);`;

              const param = empChoice.indexOf(data.delEmp) + 1;

              db.query(sql, param, (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(data.delEmp + ' has been deleted from database');

                menuQ();
              });
            });
      }
    });
}

// main menu function that prompts user to choose what to do and then based on that selection runs a new function
var menuQ = () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'menu',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update employee role',
        'View utilized budget by department',
        'Update employee manager',
        'View employees by manager',
        'View employees by department',
        'Delete a department, role or employee',
        'Quit',
      ],
    })
    .then((data) => {
      switch (data.menu) {
        case 'View all departments':
          return viewDepts();
        case 'View all roles':
          return viewRoles();
        case 'View all employees':
          return viewEmpls();
        case 'Add a department':
          return addDept();
        case 'Add a role':
          return addRole();
        case 'Add an employee':
          return addEmpl();
        case 'Update employee role':
          return updateEmpl();
        case 'View utilized budget by department':
          return viewBudget();
        case 'Update employee manager':
          return updateManager();
        case 'View employees by manager':
          return viewEmpByMan();
        case 'View employees by department':
          return viewEmpByDept();
        case 'Delete a department, role or employee':
          return delOption();
        case 'Quit':
          return console.log('Goodbye');
      }
    });
};

menuQ();
