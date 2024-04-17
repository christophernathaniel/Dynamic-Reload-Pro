import { PageFlow, uuid, DatasetHandler } from '../src/PageFlow.js';


// This is a Standard Module
const ClassModule = ({ val, parent }) => {
    // Add More items to State
    const localState = { 
        ...val,
        isValue : 1,
        switchName : 'abc',
    };
    
    // Dependancies
    const [_, variables] = new PageFlow(parent, { ...localState}); // Initialise Component (parent element, variables, )
    // Initialise the Dataset Example:  <dataset data-set="object"><data data-collection="varname"  data-value="vardata" /></dataset>
    const dataset = new DatasetHandler(document.querySelector('dataset'));
    let myVariable = dataset.getVar('variable-name2123', 'new Valuuuu'); // get variable from dataset, if not create new value;


    // Typical Functions
    const functions = {

    }

    const RenderComponent = () => {
        const id = uuid();

        let button = _.node(`<button @ref="${id}_06" @update="${id}_07" @trigger="click">{{ switchName }}</button>`, 
            (_this) => { variables.switchName = variables.isValue = variables.isValue + 1;   }, // What happens to this element
            (_this) => { return variables.switchName }, // What Happens when Re-Rendering
            (_this) => { variables.isValue = 1; return 1 } // Set Defaults when Rendering
        );

        _.node(`<span @ref="${id}_07">{{ switchName }}</span>`, null, null, (_this) => { return 1 } );

        _.render();
    };

    return {
        RenderComponent: RenderComponent // Return the Render Component
    };
};



export { ClassModule as default }