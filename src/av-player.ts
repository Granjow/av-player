import { AvPlayerFactory, MediaPlayerName } from './av-player-factory';
import { IPlayMedia } from './i-play-media';

const EventEmitter = require( 'events' );

/**
 * # Audio/Video player
 *
 * This player checks the availability of some common players (mplayer, vlc, omxplayer) and uses what is available
 * to play given media.
 *
 * ## Events
 *
 * ### `ready`
 *
 * Emitted when the AV player is ready and has checked the available players.
 *
 * ### `start`
 *
 * Video has been started.
 *
 * ### `stop`
 *
 * Video has been stopped.
 *
 * ### `error`
 *
 * Some kind of error has occurred. Must be handled, otherwise the process exit(1)s.
 */
export class AvPlayer extends EventEmitter {

    private _factory: AvPlayerFactory;
    private _volume: number;
    private _loop: boolean;
    private _activePlayer: IPlayMedia | undefined;
    private _file: string | undefined;

    private _startedAt: number | undefined;

    /**
     * @param preferredPlayers Defines the order of preferred audio/video players. The first existing is used.
     * See {@link AvPlayerFactory} for a list of valid players.
     */
    constructor( preferredPlayers?: MediaPlayerName[] ) {
        super();

        this._factory = new AvPlayerFactory( { preferredOrder: preferredPlayers } );

        this._volume = 100;
        this._loop = false;
        this._activePlayer = undefined;
    }

    /**
     * Stops the player *and* disables looping.
     */
    stop(): Promise<void> {
        this.loop = false;
        return this._stop();
    }

    /**
     * Play back the specified file.
     * If playback is already active, it is stopped and then the new file is played back.
     *
     * Note: Do not forget to handle the error event.
     *
     * @return Promise which resolves as soon as playback has started.
     */
    play( file: string ): Promise<any> {
        this._file = file;
        return this._stop().then( () => this._play( file ) );
    }

    /**
     * Set the audio volume. This does not affect the current playback as it is passed as command-line argument.
     * @param volume Volume, between 0 and 100
     */
    set volume( volume: number ) {
        volume = Number( volume );
        if ( isNaN( volume ) || volume < 0 || volume > 100 ) throw new Error( 'volume must be a number between 0 and 100' );
        this._volume = volume;
    }

    /**
     * @param loop When `true`, the file is looped.
     */
    set loop( loop: boolean ) {
        this._loop = loop;
    }

    get volume(): number {
        return this._volume;
    }

    /**
     * Returns the file that is currently loaded
     */
    get file(): string | undefined {
        return this._file;
    }

    /**
     * Returns the elapsed time in milliseconds since playback started.
     */
    get elapsed(): number | undefined {
        return this._startedAt && ( Date.now() - this._startedAt );
    }

    get status() {
        return {
            volume: this._volume,
            file: this._file,
            running: this.running,
        };
    }

    get running(): boolean {
        return this._activePlayer?.running ?? false;
    }

    private async _play( file: string ): Promise<void> {
        if ( !this._activePlayer ) {
            this._activePlayer = await this._factory.createPlayer();
            this._activePlayer.onPlaybackState( ( running ) => {
                if ( running ) {
                    this._started();
                } else {
                    this._stopped();
                }
            } );
        }

        this._activePlayer.volume = this._volume;
        return this._activePlayer.play( file );
    }

    private _stop(): Promise<void> {
        return this._activePlayer?.stop() ?? Promise.resolve();
    }

    private _started() {
        this._startedAt = Date.now();
        setImmediate( () => this.emit( 'start' ) );
    }

    private _stopped() {
        this._startedAt = undefined;
        setImmediate( () => this.emit( 'stop' ) );
        if ( this._loop && this._file !== undefined ) {
            console.log( 'Loop: Restarting audio file' );
            this.play( this._file )
                .catch( ( err ) => this.emit( 'error', err ) );
        } else {
            console.log( 'Not restarting.', this._loop );
        }
    }

    _error( err: Error ) {
        this._startedAt = undefined;
        setImmediate( () => this.emit( 'error', err ) );
        console.error( 'Player error: ' + err );
    }

}
