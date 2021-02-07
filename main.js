'use strict';

const utils = require('@iobroker/adapter-core');
const request = require('request');


class Bmejson extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'bmejson',
        });
        this.on('ready', this.onReady.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        let it = {"sensorName": this.config.sensorName, "sensorAddress": this.config.sensorAddress,};
        let adapter = this;

        request("http://"+ it.sensorAddress+"/", function (error, response, body) {
            if (error){
                adapter.log.error('error[sensor='+it.sensorName+']:', error.message);
            }
            else{
                if(response.statusCode === 200){
                    let timestamp = Date.now();
                    let timestring = (new Date()).toISOString().replace("T", " ").split(".")[0];
                    try{
                        let data = {
                            "sensorName": it.sensorName, 
                            "sensorAddress": it.sensorAddress,
                            "timestamp": timestamp,
                            "timestring": timestring,
                            ...JSON.parse(body)
                        }; 
                        Object.keys(data).forEach(async (key) => {
                            await adapter.setObjectNotExistsAsync(key, {
                                type: 'state',
                                common: {
                                    name: key,
                                    role: 'value',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                    
                            await adapter.setStateAsync(key, data[key]);
                        });
                    }
                   catch(e){
                        adapter.log.error('error[sensor='+it.sensorName+']:', e.message);
                   }
                }
            }
        });

        setTimeout(() => {
            adapter.terminate(
                "done",
                utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION,
            );
        }, 3000);

    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Bmejson(options);
} else {
    // otherwise start the instance directly
    new Bmejson();
}