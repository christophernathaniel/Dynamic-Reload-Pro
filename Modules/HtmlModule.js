import { PageFlow, HTMLflow, uuid, DatasetHandler } from '../src/PageFlow.js';


// HTML Rendered Moduke
const HtmlModule = ({ val, parent }) => {
    // Add More items to State
    const localState = { 
       ...val,
       switchName : 'Clear Input',
       switchValue : ''
   };

   // Include PageFlow Dependancies
   const [_, variables] = new PageFlow(parent, { ...localState}); // Initialise Component
   // Initialise the Dataset Example:  <dataset data-set="object"><data data-collection="varname"  data-value="vardata" /></dataset>
   const dataset = new DatasetHandler(document.querySelector('dataset')).parseData();

   // Typical Functions
   const functions = {
       testCallback: (_this) => { // use callback="clearCallback" on HTML Element
           return (_this.value) ? _this.value : ' ';
       },
       clearCallback: (_this) => { // use postcallback="clearCallback" on HTML Element
           return ' ';
       },
       defaultCallback: (_this) => { // use defaultcallback="defaultCallback" on HTML Element
          return '12';
       }
   }

   // Render Component (Loops the HTML values)
   const RenderComponent = () => {
       const id = uuid(); // Generate UUID for block Module. Each time RenderComponent is called the ID gets reset.
       
       document.querySelectorAll(parent + ' [html]').forEach((item) => {
           HTMLflow(_, {item}, functions, id); // HTMLflow renders components
       });

       _.render(); // Final Render Component (Forces render to produce up to date Application State )
   };

   return {
       RenderComponent: RenderComponent // Return the Render Component
   };
};

export { HtmlModule as default }