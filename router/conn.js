var express = require('express');
var util = require('util');
var mysql = require('mysql');

var conn = mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'',
    database:'intern_newsportal'
})

var sql = util.promisify(conn.query).bind(conn);

module.exports = sql;