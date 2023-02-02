import { AbstractPlayer, AbstractPlayerArgs } from '../abstract-player';
import ChildProcess from 'child_process';
import { IPlayMedia } from '../ports/i-play-media';

export class VlcPlayer extends AbstractPlayer implements IPlayMedia {

    static checkAvailability(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            ChildProcess.exec( 'cvlc --version', ( err: any ) => {
                if ( err ) reject();
                else resolve();
            } );
        } );
    }

    constructor( args: AbstractPlayerArgs ) {
        super( args );
    }

    get running() {
        return !!this._process;
    }

    get playerName() {
        return 'cvlc';
    }

    get vlcVolume() {
        return this._volume / 100 * 2;
    }

    async play( filePath: string ): Promise<void> {
        let stderr = '';

        const args: string[] = [
            '--play-and-exit',
            `--gain=${this.vlcVolume}`,
            '--no-video-title-show',
            '-f', filePath,
        ];

        this.logger?.debug( `Running cvlc ${args.join( ' ' )}` );

        this._process = ChildProcess.spawn(
            'cvlc',
            args,
            {
                env: this.customEnv
            }
        );

        this._process.stderr?.on( 'data', ( data: any ) => {
            const errorString = data.toString();
            if ( errorString.includes( 'error' ) ) {
                this.logger?.warn( `Error on stderr: ${errorString}` );
            }

            stderr += errorString;
            stderr.split( '\n' )
                .filter( line => line.indexOf( 'cannot open file' ) > 0 )
                .some( ( err: string ) => {
                    this.emitError( new Error( err ) );

                    this.logger?.error( `Error: ${err}.\nComplete stderr: ${stderr}` );

                    this.stop();
                    return true;
                } );
            if ( errorString.includes( 'window not available' ) ) {
                this.emitError( new Error( 'No window available. Consider using fkms instead of kms if on a Raspi 4.' ) );

                this.logger?.error( `Error: ${errorString}.\nComplete stderr: ${stderr}` );

                this.stop();
                return true;
            }
        } );

        this._process.on( 'exit', () => {
            this.logger?.debug( `Exited from playing ${filePath}.` );
            this.stop();
        } );
        this._process.on( 'error', ( err: Error ) => {
            this.logger?.error( 'Error!', err );
            this.emitError( err );
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

    private _process: ChildProcess.ChildProcess | undefined = undefined;

}
