# Employee Tracker

## Description

This is a command line application that allows the user to view, add and update various functions regarding their employees, roles and departments.

## Installation

The repo will need to be forked from github, once this has been done run npm install to download the relevant dependencies. There is a .env.Example file that will need to be edited to a .env file with your own mysql username and password filled in. The file will need to be renamed .env as well. Once this has been done and the dependencies installed the project will work.

## Usage

Begin the project logging into the mysql shell and running the schema.sql file to create the database and tables. Then the project will be started by logging out of mysql and typing node server.js. This will bring you to a main menu where you can choose to:

- View departments, roles and employees;
- Add departments, roles or employees;
- Update employee roles or managers;
- Delete departments, roles or employees;
- View the utilized budget per department;
- View employees by manager or department.

Once the relelvant option has been chosen from the menu you will be taken to that section of the app and either shown the information requested, or given further prompts to add or edit information. You will then be taken back to the main menu where you can decided what to do next, or quit and end the server by pressing ctrl + c.

## Walkthrough video

Please click this [link](link here for video) to watch a walkthrough video on how to use the application.

## Questions

If there are any questions regarding this project please visit my GitHub profile which has contact information - [DanLawrence91](https://github.com/DanLawrence91)
