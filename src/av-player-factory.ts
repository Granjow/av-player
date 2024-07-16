import { OmxPlayer } from './specific-players/omx-player';
import { MPlayer } from './specific-players/m-player';
import { VlcPlayer } from './specific-players/vlc-player';
import { IPlayMedia } from './ports/i-play-media';
import { IConfigurePlayer } from './ports/i-configure-player';
import { IConfigureFactory } from './ports/i-configure-factory';
import { FactoryConfig } from './factory-config';
import { MediaPlayerName } from './media-player-name';
import { ILogger } from '@geheimgang188/i-logger';
import { AbstractPlayerArgs } from './abstract-player';

export type TConfigurator = ( config: IConfigureFactory ) => any | Promise<any>;

export interface AvPlayerFactoryArgs {
    configurator?: TConfigurator;
    logger?: ILogger;
}

/**
 * Creates an A/V player.
 */
export class AvPlayerFactory {

    private _logger: ILogger | undefined;
    private readonly _supportedPlayers: Set<MediaPlayerName> = new Set();
    private readonly _config: IConfigureFactory = new FactoryConfig();

    private _factoriesInitialised = false;

    private readonly _configurator: TConfigurator | undefined;

    constructor( args: AvPlayerFactoryArgs ) {
        this._logger = args.logger;
        this._configurator = args.configurator;
    }

    async createPlayer(): Promise<IPlayMedia> {

        if ( this._configurator !== undefined ) {
            this._logger?.debug( `Configuring AVPlayer.` );
            const result = this._configurator( this._config );
            if ( result !== undefined && result instanceof Promise ) {
                await result;
            }
            if ( this._config.logger !== undefined ) {
                this._logger = this._config.logger;
            }
            this._logger?.debug( `Configuration done.` );
        }
        await this.initPlayers();

        for ( const player of this._config.preferredPlayerOrder ) {
            if ( this._supportedPlayers.has( player ) ) {
                let playerInstance: ( IPlayMedia & IConfigurePlayer ) | undefined;
                const baseArgs = ( playerName: string ): AbstractPlayerArgs => ( {
                    logger: this._logger?.child( { what: `AVPlayer (${playerName})` } ),
                } );
                switch ( player ) {
                    case MediaPlayerName.omxplayer:
                        playerInstance = new OmxPlayer( baseArgs( 'omxplayer' ), this._config.omxPlayerArgs );
                        break;
                    case MediaPlayerName.cvlc:
                    case MediaPlayerName.vlc:
                        playerInstance = new VlcPlayer( baseArgs( 'VlcPlayer' ), this._config.vlcPlayerArgs );
                        break;
                    case MediaPlayerName.mplayer:
                        playerInstance = new MPlayer( baseArgs( 'MPlayer' ) );
                        break;
                }

                if ( playerInstance !== undefined ) {
                    this._logger?.info( `Created player of type ${player}` );
                    if ( this._config.customEnv !== undefined ) {
                        this._logger?.debug( `Setting custom environment for video player: ${JSON.stringify( this._config.customEnv )}` );
                        playerInstance.setCustomEnv( this._config.customEnv );
                    }
                    return playerInstance;
                }
            }
        }

        throw new Error( 'No players available.' );
    }

    /**
     * Get a list of available factories.
     * Factories are only available if the corresponding player is installed.
     */
    private async initPlayers(): Promise<void> {
        if ( !this._factoriesInitialised ) {

            const name = 'AvPlayerFactory';

            const vlcCheck = VlcPlayer.checkAvailability().then(
                () => {
                    this._logger?.info( name + ': ✓ cvlc is available.' );
                    this._supportedPlayers.add( MediaPlayerName.vlc );
                    this._supportedPlayers.add( MediaPlayerName.cvlc );
                },
                () => this._logger?.info( name + ': ✗ cvlc not available.' )
            );

            const omxCheck = OmxPlayer.checkAvailability().then(
                () => {
                    this._logger?.info( name + ': ✓ omxplayer is available.' );
                    this._supportedPlayers.add( MediaPlayerName.omxplayer );
                },
                () => this._logger?.info( name + ': ✗ omxplayer not available.' )
            );

            const mplayerCheck = MPlayer.checkAvailability().then(
                () => {
                    this._supportedPlayers.add( MediaPlayerName.mplayer );
                    this._logger?.info( name + ': ✓ mplayer is available.' );
                },
                () => this._logger?.info( name + ': ✗ mplayer not available.' )
            );

            await Promise.all( [ vlcCheck, omxCheck, mplayerCheck ] );

            this._factoriesInitialised = true;
        }
    }

}
