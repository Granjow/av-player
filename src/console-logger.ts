import { ILogger } from '@geheimgang188/i-logger';

export class ConsoleLogger implements ILogger {

    private _bindingsString = '';

    child( bindings: Object ): ILogger {
        const entries = Object.entries( bindings );
        if ( entries.length > 0 ) {
            this._bindingsString = `[ ${entries.map( el => `${el[ 0 ]}: ${el[ 1 ]}` ).join( ', ' )} ]: `;
        } else {
            this._bindingsString = '';
        }

        return this;
    }

    debug( ...args: any ): void {
        console.log( this._bindingsString, ...args )
    }

    error( ...args: any ): void {
        console.error( this._bindingsString, ...args );
    }

    info( ...args: any ): void {
        console.log( this._bindingsString, ...args )
    }

    trace( ...args: any ): void {
        console.log( this._bindingsString, ...args )
    }

    warn( ...args: any ): void {
        console.log( this._bindingsString, ...args )
    }
}
