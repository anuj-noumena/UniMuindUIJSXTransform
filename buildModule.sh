#!/bin/bash

npx babel --plugins @babel/plugin-transform-modules-commonjs src/helpers.js > dist/helpers.js
npx babel --plugins @babel/plugin-transform-modules-commonjs src/jsxPropsTransform.js > dist/jsxPropsTransform.js
npx babel --plugins @babel/plugin-transform-modules-commonjs src/jsxLoader.js > dist/jsxLoader.js
