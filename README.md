# Webpack Walkthrough

## Setup

1. `npm init -y`
2. `npm i -D webpack webpack-cli webpack-dev-server` - the bundler, the cli interface and a dev server
3. In the `scripts` block of `package.json` create:

```json
"scripts": {
  "start": "webpack serve",
  "watch": "webpack --watch",
  "build": "webpack"
}
```

`start` is the dev server
`watch` watches and recompiles files
`build` independantly builds the final product

4. Create a `src` folder and include a script `index.js`
5. Add some stuff to it, like:

```javascript
function double(number) {
  return number * 2;
}

const me = {
  name: "james",
  age: 45,
};

console.log("me", me);

document.getElementById("mount").textContent = `Age: ${double(me.age)}`;
```

6. `npm run build` and check your newly created `dist` folder (which you should exclude in git) and you'll see a `main.js` has been created. See how it has been automatically been minified, uglified, and made [terser](https://www.npmjs.com/package/terser-webpack-plugin)

7. (FOR DEMO ONLY) Add an index.html to your dist file and link up your main.js

8. Create a `webpack.config.js` file and add the following:

```javascript
const path = require("node:path");
module.exports = {
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    open: true,
  },
};
```

9. Do `npm start` to get the dev server running and you'll see that it opens at the project root and you can click on `dist` and get the page BUT we want to change that, so we'll have to create a settings file...

10. The 'mode' by default is `production` but if you set it to `development it will show you where in the original src folder the logs come from.

11. If you make changes to the index.js then you'll see that reflected in the browser BUT that is not reflected in the `main.js`. To fix (tempararily) put `devtool:false,` in your config file (if this doesn't work, do `npm run build`). Look at the difference now in the files. They are edited and commented by webpack.

## Cleaning and moving the html file

1. Create a clean task in `package.json` that deletes the dist folder

```json
"clean": "rm -rf ./dist"
```

2. Install the `html-webpack-plugin` (`npm i -D html-webpack-plugin`)
3. Import it and add it to your plugins in the config

```javascript
  const HtmlWebpackPlugin = require("html-webpack-plugin");
  // ...
  plugins: [new MiniCSSExtractPlugin(), new HtmlWebpackPlugin({
    template: './src/index.html'
  })],
```

## Transpilation

1. We'd like to use react, so `npm i react react-dom`
2. In `src/index.js` we add the lines

```javascript
import React from "react";
import ReactDOM from "react-dom";
```

...but when we run our code it breaks! (It will also break if you use JSX) We need to transpile...

3. Install `npm i -D babel-loader @babel/core @babel/preset-env`
4. The first one of those is called a 'loader' - it's used for loading non-javascript assets to be then handled by js.
5. The last one is a 'plugin'. It's used to add functionality to the process
6. In our config we need to set some 'traps' to get the code to run through the right plugins and loaders, so in your config js put:

```javascript
module: {
  rules: [
    // this is an array for our different rules, js, .scss, etc.
    {
      test: /\.js$/, // test by regex
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
      },
    },
  ];
}
```

5. to avoid clutter let's create a `babel.config.js` file and add it to

```javascript
module.exports = {
  presets: ["@babel/preset-env"],
};
```

6. If you now compile you'll see webpack begin to use babel to add necessary fallback functionality
7. Some things, like private class fields are a problem because they're not enabled by default with babel. (See https://babeljs.io/docs/en/presets/) So in your `babel.config` add:

```javascript
plugins: ["@babel/plugin-proposal-class-properties"];
```

and install it `npm i -D @babel/plugin-proposal-class-properties`

## Sourcemap

Change `devtool: false` to `devtool: 'source-map'` to get sourcemaps.

Let's add 2 parts to allow an environment variable to be passed between the 2. In your `webpack.config.js` let's add:

```javascript
module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  // etc....
};
```

then we can update the scripts block:

```json
{
  "build": "NODE_ENV=production webpack",
  "build:dev": "webpack"
}
```

## With React

1. `npm i react react-dom`
2. `npm i -D @babel/preset-react` (and add "@babel/preset-react" to the presets in your babel.config.js file)
3. Change your `src/index.js` to:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <div>Hello World</div>;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
```

Link up to HTML page (enusring root elemen is present and script is deferred)

## Styles

1. If you add a `styles` folder and a `index.css` file inside it and import it in `index.js` (`import "./styles/index.css";`) it'll blow up because 'no loader', so we need to change that. Install: `npm i -D css-loader mini-css-extract-plugin` (`style-loader` injects into your but `mini-css-extract-plugin` creates CSS files)

```javascript
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
```

add this to `plugins: [new MiniCSSExtractPlugin()]` in your weback.config (create if neccessary)

then in the rules array, add:

```javascript
      {
        test: /\.css$/,
        use: [{
          loader: MiniCSSExtractPlugin.loader,
          options: {
            publicPath: '' // avoids a gotcha with images later
          }
        },
        'css-loader']
      },
```

Do `npm run build` to see the output! :)

## Images

1. Install file-loader `npm i -D file-loader`
2. Add mew rule:

```javascript
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource',
}
```

3. You should now be able to include and buld with images. If you want to change the path use output in your config, like so: `

```javascript
output: {
  assetModuleFilename: "images/[name][ext][query]"; // Cache busting can be done like: "images/[name].[hash][ext][query]" but you need to reconcile, which is easy in react but not static html
}
```

Image optimisation can then be done like: <https://webpack.js.org/plugins/image-minimizer-webpack-plugin/> (see webpack folder)

```javascript
{
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
```

## Changing webpack babel loader for esbuild
