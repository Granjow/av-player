import { ISubscribePlaybackState } from './ports/i-subscribe-playback-state';
import { EventEmitter } from 'events';
import { ISubscribeError } from './ports/i-subscribe-error';
import { IConfigurePlayer } from './ports/i-configure-player';

export abstract class AbstractPlayer implements ISubscribePlaybackState, ISubscribeError, IConfigurePlayer {

    protected customEnv: NodeJS.ProcessEnv | undefined;

    protected constructor() {
        this._volume = 50;
    }

    protected emitPlaybackChange( running: boolean ): void {
        this._events.emit( 'playback', running );
    }

    protected emitError( error: Error ): void {
        this._events.emit( 'error', error );
    }

    onPlaybackState( cb: ( running: boolean ) => void, once?: boolean ) {
        if ( once === true ) {
            this._events.once( 'playback', cb );
        } else {
            this._events.on( 'playback', cb );
        }
    }

    onError( cb: ( error: Error ) => void, once?: boolean ) {
        if ( once === true ) {
            this._events.once( 'error', cb );
        } else {
            this._events.on( 'error', cb );
        }
    }

    setCustomEnv( env: NodeJS.ProcessEnv ) {
        this.customEnv = env;
    }

    /**
     * @param volume Volume between 0 and 100
     */
    set volume( volume: number ) {
        this._volume = volume;
    }

    get volume(): number {
        return this._volume;
    }

    protected _volume: number;

    protected readonly _events = new EventEmitter();

}
