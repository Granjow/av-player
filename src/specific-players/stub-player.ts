import { IPlayMedia, PlayOptions } from '../ports/i-play-media';
import { IConfigurePlayer } from '../ports/i-configure-player';
import { AbstractPlayerArgs } from '../abstract-player';
import { ILogger } from '@geheimgang188/i-logger';

export class StubPlayer implements IPlayMedia, IConfigurePlayer {

    volume: number = 0;
    running: boolean = false;
    playerName: string = 'StubPlayer';

    private readonly _logger: ILogger | undefined;

    constructor( args: AbstractPlayerArgs ) {
        this._logger = args.logger?.child( { what: 'Player Stub' } );
    }

    setCustomEnv( env: NodeJS.ProcessEnv ): void {
        this._logger?.debug( `env set to ${JSON.stringify( env )}` );
    }

    async play( filePath: string, playOptions?: PlayOptions ): Promise<void> {
        this._logger?.debug( `Playing file ${filePath} with options ${JSON.stringify( playOptions )}` );
        this.running = true;
    }

    async stop(): Promise<void> {
        this._logger?.debug( `Stopping playback` );
        this.running = false;
    }

    onPlaybackState( cb: ( running: boolean ) => void, once?: boolean ): void {
        this._logger?.debug( `onPlaybackState not implemented in Stub` );
    }

    onError( cb: ( error: Error ) => void, once?: boolean ): void {
    }

}
