import { OmxPlayer } from './specific-players/omx-player';
import { MPlayer } from './specific-players/m-player';
import { VlcPlayer } from './specific-players/vlc-player';
import { IPlayMedia } from './ports/i-play-media';
import { IConfigurePlayer } from './ports/i-configure-player';
import { IConfigureFactory } from './ports/i-configure-factory';
import { FactoryConfig } from './factory-config';
import { MediaPlayerName } from './media-player-name';

export interface AvPlayerFactoryArgs {
    configurator?: ( config: IConfigureFactory ) => void;
}

/**
 * Creates an A/V player.
 */
export class AvPlayerFactory {

    private readonly _supportedPlayers: Set<MediaPlayerName> = new Set();

    private _config: IConfigureFactory = new FactoryConfig();

    private _factoriesInitialised = false;

    constructor( args: AvPlayerFactoryArgs ) {
        if ( args.configurator !== undefined ) {
            args.configurator( this._config );
        }
    }

    async createPlayer(): Promise<IPlayMedia> {

        await this.initPlayers();

        for ( const player of this._config.preferredPlayerOrder ) {
            if ( this._supportedPlayers.has( player ) ) {
                let playerInstance: ( IPlayMedia & IConfigurePlayer ) | undefined;
                switch ( player ) {
                    case MediaPlayerName.omxplayer:
                        playerInstance = new OmxPlayer( this._config.omxPlayerArgs );
                        break;
                    case MediaPlayerName.cvlc:
                    case MediaPlayerName.vlc:
                        playerInstance = new VlcPlayer();
                        break;
                    case MediaPlayerName.mplayer:
                        playerInstance = new MPlayer();
                        break;
                }

                if ( playerInstance !== undefined ) {
                    if ( this._config.customEnv !== undefined ) {
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
                    console.log( name + ': ✓ cvlc is available.' );
                    this._supportedPlayers.add( MediaPlayerName.vlc );
                    this._supportedPlayers.add( MediaPlayerName.cvlc );
                },
                () => console.log( name + ': ✗ cvlc not available.' )
            );

            const omxCheck = OmxPlayer.checkAvailability().then(
                () => {
                    console.log( name + ': ✓ omxplayer is available.' );
                    this._supportedPlayers.add( MediaPlayerName.omxplayer );
                },
                () => console.log( name + ': ✗ omxplayer not available.' )
            );

            const mplayerCheck = MPlayer.checkAvailability().then(
                () => {
                    this._supportedPlayers.add( MediaPlayerName.mplayer );
                    console.log( name + ': ✓ mplayer is available.' );
                },
                () => console.log( name + ': ✗ mplayer not available.' )
            );

            await Promise.all( [ vlcCheck, omxCheck, mplayerCheck ] );

            this._factoriesInitialised = true;
        }
    }

}
