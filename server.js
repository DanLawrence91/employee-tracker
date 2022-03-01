const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { indexOf } = require('lodash');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'irfc1899',
    database: 'employee_db',
  },
  console.log(`Connected to the employee_db database.`)
);

function viewDepts() {
  const sql = 'SELECT id, dept_name AS department FROM department;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

function viewRoles() {
  const sql =
    'SELECT emp_role.id AS id, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary FROM emp_role JOIN department ON emp_role.department_id = department.id GROUP BY emp_role.id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

function viewEmps() {
  const sql =
    'SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id GROUP BY employee1.id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

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
      console.log(param);

      db.query(sql, param, (err, results) => {
        if (err) {
          throw err;
        }

        menuQ();
      });
    });
}

function addRole() {
  var deptChoices = [];
  db.query(`SELECT * FROM department;`, function (err, data) {
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
      const dept = deptChoices.indexOf(data.deptOfRole);
      const param = [data.role, data.salary, dept];
      console.log(param);

      db.query(sql, param, (err, results) => {
        if (err) {
          throw err;
        }
        console.log(data.role + ' added to database');

        menuQ();
      });
    });
}

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
          return viewEmps();
        case 'Add a department':
          return addDept();
        case 'Add a role':
          return addRole();
        case 'Quit':
          return console.log('Goodbye');
      }
    });
};

menuQ();
