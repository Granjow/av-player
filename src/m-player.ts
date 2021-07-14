import { AbstractPlayer } from './abstract-player';
import { IPlayMedia } from './i-play-media';

const childProcess = require( 'child_process' );

export class MPlayer extends AbstractPlayer implements IPlayMedia {

    static checkAvailability(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            childProcess.exec( 'which mplayer', ( err: Error ) => {
                if ( err ) reject();
                else resolve();
            } );
        } );
    }

    private _process: any;

    constructor() {
        super();
    }

    get running() {
        return !!this._process;
    }

    get playerName() {
        return 'mplayer';
    }

    get mplayerVolume() {
        return this._volume;
    }

    async play( filePath: string ): Promise<void> {

        // mplayer produces a lot of stdout data. When this data is not ignored in the spawn options
        // but also not read out in process.stdout.on(), it accumulates and probably fills an internal buffer,
        // causing playback to stop.
        const opts = {
            stdio: [ 'pipe', 'ignore', 'pipe' ],
        };
        const args: string[] = [ '-nogui', '-display', ':0', '-fs', '-volume', this.mplayerVolume.toString( 10 ), filePath ];
        this._process = childProcess.spawn( 'mplayer', args, opts );

        this._process.stderr.on( 'data', ( data: Buffer ) => {
            console.error( data.toString() );
        } );

        this._process.on( 'exit', () => {
            console.log( 'mplayer exited.' );
            this.stop();
        } );
        this._process.on( 'error', ( err: Error ) => {
            console.error( 'mplayer error:', err );
            this.stop();
        } );

        this.emitPlaybackChange( true );
    }

    async stop(): Promise<void> {
        if ( this._process ) {
            this._process.kill( 'SIGINT' );
            this._process.removeAllListeners();
            this._process = undefined;

            this.emitPlaybackChange( false );
        }
    }

}
