const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

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
        case 'Quit':
          return console.log('Goodbye');
      }
    });
};

menuQ();
