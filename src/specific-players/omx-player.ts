import { IPlayMedia } from '../ports/i-play-media';

import ChildProcess from 'child_process';
import { AbstractPlayer, AbstractPlayerArgs } from '../abstract-player';

export interface OmxPlayerArgs {
    /**
     * On a Raspberry Pi 4:
     * 2 = hdmi0
     * 7 = hdmi1
     * https://forums.raspberrypi.com/viewtopic.php?f=63&t=244589
     */
    additionalArgs: string[];
}

export class OmxPlayer extends AbstractPlayer implements IPlayMedia {

    private readonly _additionalArgs: string[];

    constructor( baseArgs: AbstractPlayerArgs, args: OmxPlayerArgs ) {
        super( baseArgs );

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
            '--vol',
            this.omxVolume.toString( 10 ),
        ];

        if ( !/(mp3|wav|ogg)$/i.test( filePath ) ) {
            // Video requires '-b'
            playerArgs.push( '-b' );
        }

        playerArgs.push( ...this._additionalArgs );
        playerArgs.push( filePath );

        this.logger?.debug( 'Player args: ', JSON.stringify( playerArgs ) );
        this._process = ChildProcess.spawn(
            'omxplayer',
            playerArgs,
            {
                env: this.customEnv
            }
        );
        this.emitPlaybackChange( true );

        this._process.stderr?.on( 'data', ( data: Buffer ) => {
            this.logger?.error( data.toString() );
        } );

        this._process.stdout?.on( 'data', ( data: Buffer ) => {
            this.logger?.debug( data.toString() );
        } );

        this._process.on( 'exit', () => {
            this.logger?.trace( 'Exited.' );
            this.emitPlaybackChange( false );
        } );
        this._process.on( 'error', ( err: Error ) => {
            this.logger?.error( 'Error!', err );
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
