// import './PageFlow.scss';

// Linear DOM
class PageFlow {
    constructor(page, { ...variables }) {
        this._pageFlow = []; // Pages
        this._elemFlow = []; // Elements
        this._elemFlowRef = []; // Elements Reference
        this._app = page; // asign _app
        this._variables = variables;

        // if(retainValue === false) {
        //     this._variables = Object.assign({}, variables);;
        // }

        // if(retainValue === true) {
        //     this._variables = variables;
        // }

        return [this, variables]; // Return this, and additional properties
    }

    // Function to find Ref in Array, technically a cache finder
    // that finds an existing element
    _findRef(input) {
        // Convert input to string to handle both number and string inputs
        const searchString = String(input);
        // Use the find method to search for the object with matching ref property
        let ref = this._elemFlow.find(obj => String(obj.ref) === searchString);
        
        return ref?.selector ?? null;
    }

    _findObjectByRef = (refValue) => {
        // Use the find method to search for the object with matching ref property
        return this._elemFlow.find(obj => obj['@ref'] === refValue);
    };

    _findRefObjectByRef = (refValue) => {
        // Use the find method to search for the object with matching ref property
        return this._elemFlowRef.find(obj => obj['@ref'] === refValue);
    };


    _getValue(str)  {
        const pattern = /{{\s*(.*?)\s*}}/;
        let result = str;

        const match = str.match(pattern);
        let variableValue;

        if (match) {
            const variableName = match[1].trim();
            variableValue = this._variables[variableName];

    
            if (variableValue !== undefined) {
                result = str.replace(pattern, variableValue);
            } else {
                result = null; // Variable not found
            }
        }

        return { result: result, value: variableValue };
      };
      

    // Handle the @update attribute
    _eventListener = (string) => {
        // Get Ref
        const ref = /@ref="([^"]*)"/;
        const refmatch = string.match(ref);
        const refValue = refmatch ? refmatch[1] : null;

        // Get Value
        const regex = /@trigger="([^"]*)"/;
        const match = string.match(regex);
        const value = match ? match[1] : null;

        // Get Ref
        const renderRef = /@render="([^"]*)"/;
        const renderRefmatch = string.match(renderRef);
        const renderRefValue = renderRefmatch ? renderRefmatch[1] : null;

        // on RUN event
        if(value === 'run') {
            callback(this._findObjectByRef(refValue)?.selector); // Render event by @ref
        } 

        // on CLICK event
        if(value === 'click') {
            this._findObjectByRef(refValue)?.selector.addEventListener('click', () => { this._renderEventListener(refValue);  }) // Render event by @ref + @trigger
        }

        // on INPUT field (key up) Event
        if(value === 'input') {
            this._findObjectByRef(refValue)?.selector.addEventListener('keyup', () => { this._renderEventListener(refValue);  }) // Render event by @ref + @trigger
        }
    };


    _renderEventListener = (refValue) => {
        let callback = this._findRefObjectByRef(refValue)?.callback;
        let postcallback = this._findRefObjectByRef(refValue)?.postcallback;
        let defaultcallback = this._findRefObjectByRef(refValue)?.defaultcallback;
        let string = this._findRefObjectByRef(refValue).string;
        // Chain for Re Rendering Elements
        let modifyStartValue = null;
        let modifyEndValue = null;

        if(callback) {
            let result = callback(this._findObjectByRef(refValue)?.selector);
            if(!result) {
                
            } else {
                modifyStartValue = result; 
            }
        }


        this._htmlChange(string, modifyStartValue);
        
        
       
        if(postcallback) {
            let result = postcallback(this._findObjectByRef(refValue)?.selector);
            if(!result) {
                return false;
            } else {
                modifyEndValue = result;
            }
        }

        this._updateAttribute(string, modifyEndValue);

        


    
    }


    // Process HTML change
    _htmlChange = (string, getValue) => { 
        const regex = /@ref="([^"]*)"/;
        const match = string.match(regex);
        const refValue = match ? match[1] : null;

        // if no getValue then attempt to get the string
        if(!getValue) {
            getValue =  this._getFullString(string).value;
        }

        // Return if get value is undefinde, as it'll print undefined
        if(getValue === undefined) {
            return;
        }
        
        if(this._getFullString(string).value !== this._findRefObjectByRef(refValue)?.value) {

            if(this._findRefObjectByRef(refValue)?.value) {
                // this._findRefObjectByRef(refValue).value = fullString.value;

                if ( this._findObjectByRef(refValue)?.selector?.tagName.toLowerCase() === 'input') {
                    this._findRefObjectByRef(refValue).value =  getValue
                    this._findObjectByRef(refValue).selector.value = getValue
                } else {
                    this._findRefObjectByRef(refValue).value = getValue
                    this._findObjectByRef(refValue).selector.innerHTML = getValue
                }
            }
        };
    };


    _getFullString = (string) => {
        if(this._getValue(string)) {
            return this._getValue(string);
        }

        return null;
    };


    // Update Attribute @update="1,2"
    _updateAttribute = (string, newValue = null) => {
        const regex = /@update="([^"]*)"/;
        const match = string.match(regex);
        const refValue = match ? match[1] : null;

        if(refValue == null) { return }
        let updateItems = refValue.split(',');

        updateItems.forEach(ref => {
            this._htmlChangeByRef(ref, newValue);
        });
    };




    _htmlChangeByRef = (refValue, newValue) => { 
        if(!newValue) {
            newValue = this._getFullString().value;
        }

        if(!this._findObjectByRef(refValue)) {
            return;
        }
        
        if(this._findRefObjectByRef(refValue)?.value !== null) {
            
            if (this._findObjectByRef(refValue)?.selector?.tagName.toLowerCase() === 'input') {
                // Input
                this._findRefObjectByRef(refValue).value =  newValue;
                this._findObjectByRef(refValue).selector.value =  newValue;
            } else {
                // HTML
                this._findRefObjectByRef(refValue).value = newValue;
                this._findObjectByRef(refValue).selector.innerHTML = newValue;
            }
        } else {
            console.log('refValue does not exist');
        }
    }

    node(string, callback = null, postcallback = null, defaultcallback = null) {
        // Convert Inner HTML
        // Convert {{ }} in to <div></div>
        let fullString = this._getFullString(string);

        // Load HTML changes
        this._htmlChange(string);

        // If strings already exist and haven't been changed, do not run function
        // IF string matches anything inside of  this._elemFlowRef string
        const noChange = (() => { 
            const matchedObject = this._elemFlowRef.find(obj => obj.string === string);

            if(matchedObject) {
                return this._findObjectByRef(matchedObject['@ref'])?.selector;
            }
        })();

        // Extract String Data
       const extractAttributes = (() => {
            const pattern = /(?:class|data-\w+|@ref|@trigger|@update)="([^"]*)"/g;
            const matches = string.match(pattern) || [];
            const attributes = {};

            matches.forEach(match => {
                const [attributeName, attributeValue] = match.split('=');
                attributes[attributeName] = attributeValue.replace(/"/g, ''); // Remove surrounding quotes
            });

            return attributes;
        })();


        // Extract String Data
        const extractHTML = (() => {
            const contentPattern = /<div[^>]*>([^<]*)<\/div>/;
            const contentMatch = contentPattern.exec(string);
            const content = contentMatch ? contentMatch[1].trim() : null;

            return content;
        })();


        // Replace Objects with updated values;
        const foundObject = this._findObjectByRef(extractAttributes['@ref']);
        if (foundObject) {
            const { selector } = foundObject;
            const attributesToSet = {};
        
            for (const [attributeName, attributeValue] of Object.entries(extractAttributes)) {
                if (attributeName.startsWith('@')) {
                    // Set attribute using setAttributeNodeNS for names starting with '@'
                    attributesToSet[attributeName.slice(1)] = attributeValue;
                } else {
                    // For other attribute names, use setAttribute directly
                    attributesToSet[attributeName] = attributeValue;
                }
            }
        
            // Set all attributes at once
            Object.entries(attributesToSet).forEach(([name, value]) => {
                if(name === 'ref' || name === 'trigger' || name === 'update') { return } // Avoid changing @ref or @trigger values (These are static)
                selector.setAttribute(name, value);
            });

            return selector; 
        }

        // Buld HTML out of string
        const template = document.createElement('template');
        template.innerHTML = fullString.result.trim();
        const selector = template.content.firstChild;

    
   
        if(callback) {
            selector.getAttribute('@trigger')
            selector.addEventListener(selector.getAttribute('@action'), () => {
                callback?.(null);
            })
        }
      
        // Add References
        this._elemFlow.push({ '@ref': selector.getAttribute('@ref'), selector: selector, update: null }); // update enqueues update

        this._elemFlowRef.push({ 
            '@ref': selector.getAttribute('@ref'), 
            '@trigger' : selector.getAttribute('@trigger'), 
            '@update': selector.getAttribute('@update') ?? null, 
            '@render': selector.getAttribute('@render') ?? null, 
            '@initial': selector.getAttribute('@initial') ?? null, 
            '@parent': selector.getAttribute('@parent') ?? null, 
            index: this._elemFlow.length - 1,
            class: selector.classList, 
            id: selector.getAttribute('id'),
            data: selector.dataset, 
            string: string ?? '',
            value : fullString.value ?? '',
            update:  selector.getAttribute('@load') ?? null,
            callback: callback ?? null,
            postcallback: postcallback ?? null,
            defaultcallback: defaultcallback ?? null
        }); // add Reference Value xand Index

   
        // Target Location (RENDER INITIAL ELEMENT);
        let parent = document.querySelector(this._app);

        if(this._findObjectByRef(selector.getAttribute('@parent'))?.selector) {
            parent = this._findObjectByRef(selector.getAttribute('@parent'))?.selector
        } else if(selector.getAttribute('@parent')) {
            parent = document.querySelector(selector.getAttribute('@parent'))
        } 

        parent.appendChild(selector);
        this._eventListener(string);


        return selector ?? null;
    }

    render = () => {
        this._elemFlowRef.forEach(item => {
            if(item['@update'] && item['@load'] !== false) {
                if(item['@trigger'] !== 'click') {
                 this._renderEventListener(item['@ref']); // Trigger Referenced Items
                }
            }

            if(item['@trigger'] === 'click') {
                // this._renderEventListener(item['@ref']);
            }

            if(item['@render']) {
                this._renderEventListener(item['@render']);
            }

            // Render Initial Value
            if(item['defaultcallback']) {
                console.log('run');
                // this._htmlChangeByRef(item['@ref'], item['@initial']);

                 // Update variables to be the value specified in '@initial'
               
                 // Update variables to be the value specified in '@initial'
                //  
                 // Update the HTML using initial variables

                let value = item['defaultcallback']();

                if(value) {
             

                    console.log(item['@ref']);
                    console.log('has VaLu');
                    console.log(value);
                    // Issue running this function
                    this._htmlChangeByRef(item['@ref'], value);
                }
            }
        });


    }
}


const HTMLflow = (_, obj, functions, id) => {
    let item = obj.item;

   

    // Define Values
    let object = {
        '@trigger': item.getAttribute('@trigger') ?? null,
        '@update':  item.getAttribute('@update').split(',').map(num => id + num).join(',') ?? null,
        '@ref':  item.getAttribute('@ref').split(',').map(num => id + num).join(',') ?? null,
        '@parent': item.getAttribute('@parent') ?? null,
        class: item.getAttribute('class') ?? null,
        id:  item.getAttribute('id') ?? null,
        style:  item.getAttribute('style') ?? null,
        type : item.tagName.toLowerCase(),
        value: item.value ?? null,
    }

    const noCallback = () => {} // Cover the scenario that nocallback exists

    // Define callbacks
    let callbacks = {
        callback: item.getAttribute('callback') ? functions[item.getAttribute('callback')] : noCallback,
        postcallback: item.getAttribute('postcallback') ? functions[item.getAttribute('postcallback')] : noCallback,
        defaultcallback: item.getAttribute('defaultcallback') ? functions[item.getAttribute('defaultcallback')] : noCallback
    }

    // Remove all Items
    item.remove();

    // Filter out properties with null values
    object = Object.fromEntries(Object.entries(object).filter(([key, value]) => value !== null));

  
    // Create new Node
    if(object.type === 'input') {
        _.node(`<${object.type} ${Object.entries(object).map(([key, value]) => `${key}="${value}"`).join(' ')} value="${ item.value }">`,
        callbacks.callback,
        callbacks.postcallback, 
        callbacks.defaultcallback); // Need to write callbacks.defaults here
    } else {
        _.node(`<${object.type} ${Object.entries(object).map(([key, value]) => `${key}="${value}"`).join(' ')}>${ item.innerHTML }</${object.type}>`,
            callbacks.callback,
            callbacks.postcallback,
            callbacks.defaultcallback);  // Need to write callbacks.defaults here
    }
}



// const requestQueue = new RequestQueue();
// requestQueue.enqueue(url1, this._renderPage.bind(this));
// requestQueue.enqueue(url2, this._renderPage.bind(this));
// requestQueue.cancelAll();

class RequestQueue {
    constructor() {
        this.queue = [];
        this.abortController = new AbortController();
    }

    async enqueue(url, renderFunction) {
        const request = { url: url, renderFunction };

        this.queue.push(request);

        try {
            await this.processQueue();
        } catch (error) {
            console.error('Error processing request queue:', error);
        }
    }

    async processQueue() {
        while (this.queue.length > 0) {
            const { url, renderFunction } = this.queue.shift();
            const { signal } = this.abortController;

            try {
                const response = await fetch(url, { signal });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data from ${url}. Status: ${response.status} ${response.statusText}`);
                }

                // const contentType = response.headers.get('content-type');
                // if (!contentType || !contentType.includes('application/json')) {
                //     throw new Error(`Invalid content type received from ${url}. Expected JSON.`);
                // }

                const data = await response.text();

                if (!data || Object.keys(data).length === 0) {
                    throw new Error(`No valid data received from ${url}`);
                }

                renderFunction(data);
            } catch (error) {
                console.error(`Error while fetching or rendering data from ${url}:`, error);
            }
        }
    }

    cancelAll() {
        this.abortController.abort();
        this.abortController = new AbortController();
        this.queue = [];
    }
}



// const dynamicPage = new DynamicPage({ source: '.selector', target: '.selector' }, renderList));
// cons dynamicPage._makeRequest(url);

class DynamicPage {
    constructor(obj, renderList) {
        this.cache = [];
        this.url = window.location.protocol + "//" + window.location.host;
        this.source = obj.source;
        this.target = obj.target;
        this.requestQueue = new RequestQueue();
        this.renderList = renderList;
    }
    // Adds or updates a page in the cache
    upsertPage(url, data) {
        const index = this.cache.findIndex(page => page.url === url);

        if (index > -1) {
            this.cache[index].data = data;
        } else {
            this.cache.push({ url, data });
        }
    }

    // Retrieves a page from the cache
    getPage(url) { return this.cache.find(page => page.url === url); }

    // Checks if a page exists in the cache
    exists(url) { return this.cache.some(page => page.url === url && page.data !== null && page.data !== undefined && page.data !== ''); }
    
    // Removes a page from the cache
    removePage(url) { this.cache = this.cache.filter(page => page.url !== url); }

    // Clears the entire cache
    clear() { this.cache = []; }
    getAllPages() { return this.cache; }

    runCallbacks = (callbacks, callbackArgs) => {
    
        callbacks.forEach(callback => {
            callback(callbackArgs);
        });
    }
    
   

    // Render the new Page Data
    _renderPage(data) {
       
    
       
    }

    // Request Page from URL (HTTP REQUEST)
    _makeRequest(url) {
        this.requestQueue.enqueue(url, this._processRequest.bind(this) );
    }

    _processRequest(data) {

        // if (this.target) {
        //     const childElements =  document.querySelector(this.target).querySelectorAll('*');
        //     childElements.forEach(child => {
        //         child.parentNode.removeChild(child);
        //     });
        // }

        document.querySelector(this.target).innerHTML='';
        
        let parser = new DOMParser();
        let doc = parser.parseFromString(data, "text/html");
        let sourceElement = doc.querySelector(this.source);
        
        if (sourceElement) {
            document.querySelector(this.target).appendChild(sourceElement.cloneNode(true));
        } else {
            console.error("Source element not found");
        }
   
        this.runCallbacks(this.renderList);
        
       
    
      

        return true;
    }

}

// This is how to use DatasetHandler
// const datasetHandler = new DatasetHandler(document.querySelector('dataset'));
// const dataset = datasetHandler.parseData();

class DatasetHandler {
    constructor(datasetElement) {
        this.datasetElement = datasetElement;
        this.dataMap = this.parseData();
    }

    parseData() {
        const { datasetElement } = this;
        
        if (!datasetElement || !datasetElement.dataset.set) return null;

        const { set: datasetName } = datasetElement.dataset;
        const dataElements = Array.from(datasetElement.querySelectorAll('data'));

        if (!dataElements.length) return null;

        const dataObject = dataElements.reduce((acc, dataElement) => {
            const { collection: variableName, value } = dataElement.dataset;
            acc[variableName] = value;
            return acc;
        }, {});

        return new Map([[datasetName, dataObject]]);
    }

    getVar(variableName, defaultValue) {
        if (!this.dataMap) return defaultValue;

        const datasetObject = this.dataMap.get(this.datasetElement.dataset.set);
        if (!datasetObject) return defaultValue;

        return datasetObject[variableName] !== undefined ? datasetObject[variableName] : defaultValue;
    }
}


const uuid = () => ([1e3]+-1e2+-4e2+-8e2+-1e12).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));


// export { PageFlow, HTMLflow, DynamicPage, uuid };


module.exports = {
    PageFlow,
    HTMLflow,
    DynamicPage,
    uuid,
    DatasetHandler
}
