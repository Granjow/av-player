import { OmxPlayer, OmxPlayerArgs } from './omx-player';
import { MPlayer } from './m-player';
import { VlcPlayer } from './vlc-player';
import { IPlayMedia } from './i-play-media';

export enum MediaPlayerName {
    vlc = 'vlc',
    cvlc = 'cvlc',
    mplayer = 'mplayer',
    omxplayer = 'omxplayer',
}

export interface AvPlayerFactoryArgs {
    /**
     * If defined, only the listed players will be checked for availability,
     * and the first one that is available will be used.
     */
    preferredOrder?: MediaPlayerName[];
}

/**
 * Creates an A/V player.
 */
export class AvPlayerFactory {

    private readonly _preferredOrder: MediaPlayerName[];
    private readonly _supportedPlayers: Set<MediaPlayerName> = new Set();

    private _omxPlayerArgs: OmxPlayerArgs = { additionalArgs: [] };

    private _factoriesInitialised = false;

    constructor( args: AvPlayerFactoryArgs ) {
        this._preferredOrder = args.preferredOrder ?? [ MediaPlayerName.omxplayer, MediaPlayerName.cvlc, MediaPlayerName.mplayer ];
    }

    async createPlayer(): Promise<IPlayMedia> {

        for ( const player of this._preferredOrder ) {
            if ( this._supportedPlayers.has( player ) ) {
                switch ( player ) {
                    case MediaPlayerName.omxplayer:
                        return new OmxPlayer( this._omxPlayerArgs );
                    case MediaPlayerName.cvlc:
                    case MediaPlayerName.vlc:
                        return new VlcPlayer();
                    case MediaPlayerName.mplayer:
                        return new MPlayer();
                }
            }
        }

        throw new Error( 'No players available.' );
    }

    configureOmxPlayerArgs( args: OmxPlayerArgs ): void {
        this._omxPlayerArgs = args;
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
