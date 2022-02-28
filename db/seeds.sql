INSERT INTO department (dept_name)
VALUES ("Sales"),
       ("Customer Service"),
       ("Finance"),
       ("Legal");

INSERT INTO emp_role (title, salary, department_id)
VALUES ("Sales Lead", 150000, 1),
       ("Salesperson", 80000, 1),
       ("Customer Service Operator", 60000, 2),
       ("Service Manager", 100000, 2),
       ("CFO", 250000, 3),
       ("Accountant", 150000, 3),
       ("Lawyer", 190000, 4),
       ("Head of Legal", 250000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
        ("Mike", "Chann", 2, 1),
        ("Ashley", "Rodriguez", 4, null),
        ("Kevin", "Tupik", 3, 3),
        ("Kunal", "Shah", 5, null),
        ("Malia", "Brown", 6, 5),
        ("Sarah", "Lord", 7, 8),
        ("Tom", "Allen", 8, null);