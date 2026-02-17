CREATE DATABASE scolarship_system;

USE scolarship_system;

CREATE TABLe users(
ID int auto_increment PRIMARY KEY,
name VARCHAR(50) NOT NULL,
email VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(50) NOT NULL,
role ENUM("student" , "admin")NOT NULL,
roll_no VARCHAR(15) NOT NULL UNIQUE,
cgpa DECIMAL(3,2),
course VARCHAR(50),
family_income DECIMAL(10,2),
cretaed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE scholarships(
id INT AUTO_INCREMENT PRiMARY KEY,
title VARCHAR(100)NOT NULL,
description TEXT,
amount DECIMAL(10,2),
min_cgpa DECIMAL(3,2),
max_income DECIMAL(10,2),
total_seats INT NOT NULL,
approved_seats INT DEFAULT 0,
deadline DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE applications(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
scholarship_id INT NOT NULL,
status ENUM("Pending" , "Approved" , "Rejected")DEFAULT "pending",
applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,

UNIQUE(user_id , scholarship_id)
);
