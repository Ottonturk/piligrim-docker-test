import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Импортируйте BrowserRouter

//import React, { useEffect, useState } from "react";
//import { useEffect } from 'react';
//import React, { useState } from 'react';
//const { useEffect, useState } = React
//import { createRoot } from "react-dom/client";

//import { createRoot } from 'react-dom/client';

//const [state, setState] = useState(initialState)
//const container = document.getElementById('app');
//const root = createRoot(container); // createRoot(container!) if you use TypeScript
const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(<App tab="home" />);

//const rootElement = document.getElementById("root");
//const root = createRoot(rootElement);
//ReactDOM.render(
root.render(
    //<React.StrictMode>
      //  <App />
    //</React.StrictMode>,
    <React.StrictMode>
      <Router>  
        <App />
      </Router>    
    </React.StrictMode>,

    //document.getElementById('root')
);