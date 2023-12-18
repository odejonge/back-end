# back-end

## Project setup
```
npm init -y
npm install express
```



### install babel
```
npm install --save-dev @babel/core @babel/node @babel/preset-env @babel/cli @babel/plugin-transform-runtime
npm install @babel/runtime
```

### create .babelrc file in root
```
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "regenerator": true
      }
    ]
  ]
}
```
### create file server.js
create folder /src <br>
create file /src/server.js
```
import express from 'express';

const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello to you!');
})

app.listen (8000, () => {
  console.log('Server is running on port 8000')
});
```
### install nodemon
To auto-restart server when changes in the code are made
```
npm install --save-dev nodemon
```

### run node server
```
npx babel-node src/server.js
npx nodemon --exec npx babel-node src/server.js
```
add to package.json
```
{
  "name": "back-end",
  ...
  "scripts": {
    ...
    "dev": "npx nodemon --exec npx babel-node src/server.js"
  },
  ...
  },
  "devDependencies": {
    ...
  }
}
```
