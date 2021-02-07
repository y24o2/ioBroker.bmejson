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

        request("http://"+ it.sensorAddress+"/", function (error, response, body) {
            if (error){
                this.log.error('error[sensor='+it.sensorName+']:', error.message);
            }
            else{
                if(response.statusCode === 200){
                    let timestamp = Math.floor(Date.now() / 1000);
                    let timestring = (new Date()).toISOString().replace("T", " ").split(".")[0];
                    try{
                        let data = {"timestamp": timestamp, "timestring": timestring, ...JSON.parse(body)}; 
                        Object.keys(data).forEach(async (key) => {
                            await this.setObjectNotExistsAsync(key, {
                                type: 'state',
                                common: {
                                    name: key,
                                    role: 'value',
                                    read: true,
                                    write: false,
                                },
                                native: {},
                            });
                    
                            await this.setStateAsync(key, data[key]);
                        });
                    }
                   catch(e){
                        this.log.error('error[sensor='+it.sensorName+']:', e.message);
                   }
                }
            }
        });
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