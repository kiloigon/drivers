import * as mongodb from 'mongodb'

class MongoDBDriver {
    /**
     * @type {Map<string, mongodb.Db>}
     */
    static clients: Map<string, mongodb.Db> = new Map()
    /**
     * @type Promise<mongodb.Db>[]
     */
    static promises: Promise<mongodb.Db>[] = []
    /**
     * set a configuration of MongoDB
     * @function
     * @param {string} name - name of the configuration
     * @param {string} [database] - database name
     * @param {string} [url] - url of the server
     * @param {mongodb.MongoClientOptions} [options] - [MongoClient options](http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html)
     * @returns {Promise<mongodb.Db>} database
     */
    static configureWithName(
        name: string,
        database: string = 'test',
        url: string = 'mongodb://localhost:27017',
        options: mongodb.MongoClientOptions = {}
    ): Promise<mongodb.Db> {
        options.useNewUrlParser = true
        const promise: Promise<mongodb.Db> = new Promise(
            (resolve, reject) => {
                mongodb.MongoClient.connect(url, options).then(
                    connection =>
                        connection.db(database)
                ).then(
                    database => {
                        this.clients.set(name, database)
                        return database
                    }
                ).then(resolve).catch(reject)
            }
        )
        this.promises.push(promise)
        return promise
    }
    /**
     * set default configuration of MongoDB
     * @param {string} [database] - database name
     * @param {string} [url] - url of the server
     * @param {mongodb.MongoClientOptions} [options] - [MongoClient options](http://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html)
     * @returns {Promise<mongodb.Db>} database
     */
    static configure(
        database: string = 'test',
        url: string = 'mongodb://localhost:27017',
        options: mongodb.MongoClientOptions = {}
    ): Promise<mongodb.Db> {
        return this.configureWithName('default', database, url, options)
    }
    /**
     * get a client by name
     * @param {string} name 
     * @returns {mongodb.Db}
     */
    static getClient(name: string): mongodb.Db {
        return this.clients.get(name)
    }
    /**
     * get default client
     * @returns {mongodb.Db}
     */
    static get client(): mongodb.Db {
        return this.getClient('default')
    }
    /**
     * resolve all connections
     * @type Promise<mongodb.Db[]>
     */
    static get ready(): Promise<mongodb.Db[]> {
        return Promise.all(
            this.promises
        )
    }
}

export * from 'mongodb'
export const IDRegex = /^[0-9a-fA-F]{24}$/
export default MongoDBDriver