import { IPlayMedia } from './i-play-media';

import ChildProcess from 'child_process';
import { AbstractPlayer } from './abstract-player';

export interface OmxPlayerArgs {
    additionalArgs: string[];
}

export class OmxPlayer extends AbstractPlayer implements IPlayMedia {

    private readonly _additionalArgs: string[];

    constructor( args: OmxPlayerArgs ) {
        super();

        this._additionalArgs = args.additionalArgs;
    }

    static checkAvailability(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            ChildProcess.exec( 'omxplayer --version', ( err: any ) => {
                if ( err ) reject();
                else resolve();
            } );
        } );
    }

    async play( filePath: string ): Promise<void> {
        const playerArgs: string[] = [
            '-no-osd',
            '--no-keys',
            `--vol ${this.omxVolume}`,
        ];

        if ( !/(mp3|wav|ogg)$/i.test( filePath ) ) {
            // Video requires '-b'
            playerArgs.push( '-b' );
        }

        playerArgs.push( ...this._additionalArgs );

        playerArgs.push( filePath );

        console.log( 'Player args: ', JSON.stringify( playerArgs ) );
        this._process = ChildProcess.spawn(
            'omxplayer',
            playerArgs
        );
        this.emitPlaybackChange( true );

        this._process.stderr?.on( 'data', ( data: Buffer ) => {
            console.error( data.toString() );
        } );

        this._process.stdout?.on( 'data', ( data: Buffer ) => {
            console.log( data.toString() );
        } );

        this._process.on( 'exit', () => {
            console.log( 'Exited.' );
            this.emitPlaybackChange( false );
        } );
        this._process.on( 'error', ( err: Error ) => {
            console.error( 'Error!', err );
            this.emitPlaybackChange( false );
        } );
    }

    async stop(): Promise<void> {
        if ( this._process ) {
            this._process.kill( 'SIGINT' );
            try {
                ChildProcess.execSync( 'killall -SIGINT omxplayer.bin' );
            } catch ( e ) {
                // Not running anymore.
            }
            this._process.removeAllListeners();
            this._process = undefined;
            this.emitPlaybackChange( false );
        }
    }

    get running(): boolean {
        return !!this._process;
    }

    get playerName(): string {
        return 'omxplayer';
    }

    get omxVolume(): number {
        return Math.round( this._volume / 100 * 5000 - 5000 );
    }

    private _process: ChildProcess.ChildProcess | undefined = undefined;
}
