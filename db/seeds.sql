INSERT INTO department (dept_name)
VALUES ("Customer Service"),
        ("Finance"),
        ("Sales"),
       ("Legal");

INSERT INTO emp_role (title, salary, department_id)
VALUES ("CFO", 250000, 2),
        ("Lawyer", 190000, 4),
       ("Salesperson", 80000, 3),
       ("Service Manager", 100000, 1),
       ("Sales Lead", 150000, 3),
       ("Head of Legal", 250000, 4),
       ("Accountant", 150000, 2),
       ("Customer Service Operator", 60000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Kevin", "Tupik", 3, 3),
        ("Kunal", "Shah", 5, null),
        ("Sarah", "Lord", 7, 8),
        ("Mike", "Chann", 2, 1),
        ("Ashley", "Rodriguez", 4, null),
        ("John", "Doe", 1, null),
        ("Tom", "Allen", 8, null),
        ("Malia", "Brown", 6, 5);