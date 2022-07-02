"use strict";

const myfunc = function () {
  let flag = 0;
  return function () {
    return ++flag;
  };
};

const start = myfunc();

console.log(start());
