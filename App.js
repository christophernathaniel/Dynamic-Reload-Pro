import './app.scss';
import { DynamicPage } from './src/PageFlow.js';
import HtmlModule from './Modules/HtmlModule.js'; // Import HTML rendering example
import ClassModule from './Modules/ClassModule.js'; // Import Class/JS rendering example

// Global State
const state = {
    counter: 1,
}

// Components to Render on each page load. Add RenderComponent functions to the Module Classes here.
// Each time the page is loaded these functions are called
let renderList = [() => {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (a) => {
            a.preventDefault();
            dynamicPage._makeRequest(link.href); // Make Request and Render
        });
    });
}];

renderList = [...renderList, HtmlModule({  val: state, parent: '.myParent2' }).RenderComponent]; // Works
renderList = [...renderList, ClassModule({ val: state, parent: '.myParent' }).RenderComponent];

// Define DynamicPage // Source = The HTML element to grab (OuterHTML) // target = The Placement
// DynamicPage needs to load after any specified data - should technically be the last Function loaded
const dynamicPage = new DynamicPage({source: 'DynamicPage', target: 'App'}, renderList);
dynamicPage._makeRequest('index.html'); // Make Request and Render index.html to the page



