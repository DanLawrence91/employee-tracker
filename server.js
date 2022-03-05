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
        console.log(`${data.department} has been added to the database`);
        menuQ();
      });
    });
}

// function to add a new role to database
function addRole() {
  db.query(`SELECT * FROM department;`, function (err, res) {
    if (err) throw err;

    const depts = res.map(({ id, dept_name }) => ({
      name: dept_name,
      value: id,
    }));

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
          choices: depts,
        },
      ])
      .then((data) => {
        const sql = `INSERT INTO emp_role(title, salary, department_id) VALUES (?, ?, ?)`;
        const param = [data.role, data.salary, data.deptOfRole];

        db.query(sql, param, (err, results) => {
          if (err) {
            throw err;
          }
          console.log(`${data.role} has been added to the database`);

          menuQ();
        });
      });
  });
}

//function to add a new employee
function addEmpl() {
  db.query(`SELECT id, title FROM emp_role;`, function (err, res) {
    const role = res.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
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
          choices: role,
        },
      ])
      .then((data) => {
        const param = [data.first_name, data.last_name, data.empRole];
        db.query(
          `SELECT id, concat(first_name, " ", last_name) AS name FROM employee;`,
          function (err, res) {
            if (err) throw err;
            const manager = res.map(({ id, name }) => ({
              name: name,
              value: id,
            }));

            inquirer
              .prompt([
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
                  choices: manager,
                  when(answers) {
                    return answers.manager === 'Yes';
                  },
                },
              ])
              .then((manChoice) => {
                param.push(manChoice.empManager);

                const sql = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                db.query(sql, param, (err, results) => {
                  if (err) throw err;

                  console.log(
                    `${data.first_name} ${data.last_name} has been added to the database`
                  );

                  menuQ();
                });
              });
          }
        );
      });
  });
}

// function that allows for employees role to be changed by selecting which employee to change the role for, and the new role they have
function updateEmpl() {
  db.query(
    `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee;`,
    function (err, res) {
      const emplChoices = res.map(({ id, name }) => ({
        name: name,
        value: id,
      }));

      inquirer
        .prompt({
          type: 'list',
          name: 'empUpdate',
          message: 'Which employees role will you update?',
          choices: emplChoices,
        })
        .then((data) => {
          const param = [data.empUpdate];

          db.query(`SELECT id, title FROM emp_role;`, function (err, res) {
            const roleChoices = res.map(({ id, title }) => ({
              name: title,
              value: id,
            }));

            inquirer
              .prompt({
                type: 'list',
                name: 'empRoles',
                message: 'What is their new role?',
                choices: roleChoices,
              })
              .then((roleC) => {
                param.unshift(roleC.empRoles);

                const sql = `UPDATE employee SET role_id = (?) WHERE id = (?);`;

                db.query(sql, param, (err, results) => {
                  if (err) throw err;

                  console.log('Role has been updated.');

                  menuQ();
                });
              });
          });
        });
    }
  );
}

// function to view all employees managed by a certain individual. User is prompted for an individual and then shown a table of all
// employees they manage
function viewEmpByMan() {
  db.query(
    `SELECT concat(first_name, " ", last_name) AS name FROM employee;`,
    function (err, res) {
      if (err) throw err;

      const manager = res.map(({ id, name }) => ({
        name: name,
        value: id,
      }));
      inquirer
        .prompt({
          type: 'list',
          name: 'mangView',
          message: 'Which manager do you want to view employees for?',
          choices: manager,
        })
        .then((data) => {
          const sql = `SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id WHERE employee1.manager_id = (?);`;
          const param = data.mangView;
          db.query(sql, param, function (err, res) {
            console.table(res);
            menuQ();
          });
        });
    }
  );
}

// function to view all the employees for a specific department. User is prompted to select a department and then all employees for that
// department will be shown in a table along with their title
function viewEmpByDept() {
  db.query(`SELECT id, dept_name FROM department;`, function (err, res) {
    if (err) throw err;

    const dept = res.map(({ id, dept_name }) => ({
      name: dept_name,
      value: id,
    }));

    inquirer
      .prompt({
        type: 'list',
        name: 'deptView',
        message: 'Which department do you want to view the employees for?',
        choices: dept,
      })
      .then((data) => {
        const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, emp_role.title AS title, department.dept_name AS department FROM employee JOIN emp_role ON employee.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id WHERE department.id = (?);`;
        const param = data.deptView;

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
  db.query(
    `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee;`,
    function (err, res) {
      const empl = res.map(({ id, name }) => ({
        name: name,
        value: id,
      }));

      inquirer
        .prompt({
          type: 'list',
          name: 'emplUpdate',
          message: 'Which employees do you want to update?',
          choices: empl,
        })
        .then((data) => {
          const param = [data.emplUpdate];
          db.query(
            `SELECT id, CONCAT(first_name, " ", last_name) as manager FROM employee;`,
            function (err, res) {
              const manager = res.map(({ id, manager }) => ({
                name: manager,
                value: id,
              }));

              inquirer
                .prompt({
                  type: 'list',
                  name: 'emplManager',
                  message: 'Who is their new manager?',
                  choices: manager,
                })
                .then((answer) => {
                  param.unshift(answer.emplManager);

                  const sql = `UPDATE employee SET manager_id = (?) WHERE id = (?);`;

                  db.query(sql, param, (err, results) => {
                    if (err) throw err;

                    console.log('Manager has now been updated');
                    menuQ();
                  });
                });
            }
          );
        });
    }
  );
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
          return process.exit();
      }
    });
};

menuQ();
