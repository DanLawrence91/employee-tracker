SELECT * FROM department;

SELECT emp_role.id AS id, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary FROM emp_role JOIN department ON emp_role.department_id = department.id;

SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, emp_role.salary AS salary, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id;

SELECT SUM(emp_role.salary) AS utilized_budget, department.dept_name AS department FROM emp_role JOIN department ON emp_role.department_id = department.id GROUP BY department_id;

SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, emp_role.title AS title, department.dept_name AS department FROM employee JOIN emp_role ON employee.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id WHERE department.id = 2;

SELECT employee1.id AS id, employee1.first_name AS first_name, employee1.last_name AS last_name, emp_role.title AS title, department.dept_name AS department, concat(employee2.first_name, " ", employee2.last_name) AS manager FROM employee employee1 JOIN emp_role ON employee1.role_id = emp_role.id JOIN department ON emp_role.department_id = department.id LEFT JOIN employee employee2 ON employee1.manager_id = employee2.id WHERE employee1.manager_id = 2;

SELECT concat(first_name, " ", last_name) AS name FROM employee;

SELECT employee.id AS id, concat(employee.first_name, " ", employee.last_name) AS manager, emp_role.title AS title FROM employee JOIN emp_role ON employee.role_id = emp_role.id;