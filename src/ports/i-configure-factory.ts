import { OmxPlayerArgs } from '../specific-players/omx-player';
import { MediaPlayerName } from '../media-player-name';
import { ILogger } from '@geheimgang188/i-logger';
import { VlcPlayerArgs } from '../specific-players/vlc-player';

export type TFactoryConfigurator = ( config: IConfigureFactory ) => void;

export interface IConfigureFactory {
    readonly customEnv: NodeJS.ProcessEnv | undefined;

    readonly omxPlayerArgs: OmxPlayerArgs;
    readonly vlcPlayerArgs: VlcPlayerArgs;

    readonly preferredPlayerOrder: MediaPlayerName[];
    readonly logger: ILogger | undefined;

    /**
     * Use a custom logger like e.g. pino.
     * 'console' uses a console logger.
     */
    setLogger( logger: ILogger | 'console' | undefined ): IConfigureFactory;

    /**
     * Custom configuration for omxplayer.
     *
     * Note that omxplayer is deprecated and vlc should be preferred:
     * https://github.com/popcornmix/omxplayer
     *
     * See https://pimylifeup.com/raspberry-pi-omxplayer/ for details on some commands.
     *
     * --display: 2 = HDMI0 and 7 = HDMI1 (Pi 4), 5 = HDMI (Pi 1-3), 4 = Touchscreen
     */
    configureOmxPlayer( omxPlayerArgs: OmxPlayerArgs ): IConfigureFactory;

    configureVlcPlayer( vlcPlayerArgs: VlcPlayerArgs ): IConfigureFactory;


    /**
     * Custom environment variables to be used by the player.
     */
    setCustomEnv( env: NodeJS.ProcessEnv ): IConfigureFactory;

    /**
     * If defined, only the listed players will be checked for availability,
     * and the first one that is available will be used.
     */
    setPreferredOrder( order: MediaPlayerName[] ): IConfigureFactory;
}
