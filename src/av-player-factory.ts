import { OmxPlayer } from './omx-player';
import { MPlayer } from './m-player';
import { VlcPlayer } from './vlc-player';
import { IPlayMedia } from './i-play-media';

export enum MediaPlayerName {
    vlc = 'vlc',
    cvlc = 'cvlc',
    mplayer = 'mplayer',
    omxplayer = 'omxplayer',
}

export type PlayerFactoryType = new() => IPlayMedia;

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

    constructor( args: AvPlayerFactoryArgs ) {
        let priority = 0;
        for ( const playerName of args.preferredOrder ?? [] ) {
            this._playerPriorities.set( playerName, priority++ );
        }
    }

    async createPlayer(): Promise<IPlayMedia> {
        const factory = ( await this.factories() )[ 0 ];

        if ( factory !== undefined ) {
            return new factory();
        } else {
            throw new Error( 'No players available.' );
        }
    }


    /**
     * Get a list of available factories.
     * Factories are only available if the corresponding player is installed.
     */
    private async factories(): Promise<PlayerFactoryType[]> {
        if ( !this._factoriesInitialised ) {

            let factories: Map<MediaPlayerName, PlayerFactoryType> = new Map();

            const name = 'AvPlayerFactory';

            const vlcCheck = VlcPlayer.checkAvailability().then(
                () => {
                    console.log( name + ': ✓ cvlc is available.' );
                    factories.set( MediaPlayerName.cvlc, VlcPlayer );
                    factories.set( MediaPlayerName.vlc, VlcPlayer );
                },
                () => console.log( name + ': ✗ cvlc not available.' )
            );

            const omxCheck = OmxPlayer.checkAvailability().then(
                () => {
                    factories.set( MediaPlayerName.omxplayer, OmxPlayer );
                    console.log( name + ': ✓ omxplayer is available.' );
                },
                () => console.log( name + ': ✗ omxplayer not available.' )
            );

            const mplayerCheck = MPlayer.checkAvailability().then(
                () => {
                    factories.set( MediaPlayerName.mplayer, MPlayer );
                    console.log( name + ': ✓ mplayer is available.' );
                },
                () => console.log( name + ': ✗ mplayer not available.' )
            );

            await Promise.all( [ vlcCheck, omxCheck, mplayerCheck ] );

            if ( this._preferredPlayerOrder !== undefined ) {
                for ( const playerName of this._preferredPlayerOrder ) {
                    const factory = factories.get( playerName );
                    if ( factory !== undefined ) {
                        this._factories.push( factory );
                    }
                }
            } else {
                this._factories = Array.from( factories.values() );
            }
        }

        return this._factories;
    }


    private readonly _preferredPlayerOrder: MediaPlayerName[] | undefined;
    private _factories: PlayerFactoryType[] = [];
    private _factoriesInitialised = false;
    private readonly _playerPriorities: Map<string, number> = new Map();

}
