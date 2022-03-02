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

function viewDepts() {
  const sql = 'SELECT id, dept_name AS department FROM department;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

function viewRoles() {
  const sql =
    'SELECT emp_role.id AS id, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary FROM emp_role JOIN department ON emp_role.department_id = department.id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

function viewEmpls() {
  const sql =
    'SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id;';
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
      console.log(dept);
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
        name: 'empManager',
        message: "Who is the employee's manager?",
        choices: managerChoices,
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
      // console.log(emplChoices);
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

function viewBudget() {
  const sql =
    'SELECT SUM(emp_role.salary) AS utilized_budget, department.dept_name AS department FROM emp_role JOIN department ON emp_role.department_id = department.id GROUP BY department_id;';
  db.query(sql, function (err, results) {
    console.table(results);
    menuQ();
  });
}

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
              const sql = `DELETE FROM department WHERE dept_id = (?);`;

              const param = deptChoice.indexOf(data.delDept);

              db.query(sql, param, (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(data.delDept + ' has been deleted from database');

                menuQ();
              });
            });
        case 'Role':
          return delRole();
        case 'Employee':
          return delEmp();
      }
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
        'View utilized budget by department',
        'Update employee manager',
        'View employees by manager',
        'View employees by department',
        'Delete a department',
        'Delete a role',
        'Delete an emmployee',
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
