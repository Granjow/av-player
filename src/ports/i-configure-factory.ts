import { OmxPlayerArgs } from '../specific-players/omx-player';
import { IConfigurePlayer } from './i-configure-player';
import { MediaPlayerName } from '../media-player-name';
import { ILogger } from '@geheimgang188/i-logger';

export type TFactoryConfigurator = ( config: IConfigureFactory ) => void;

export interface IConfigureFactory {
    readonly customEnv: NodeJS.ProcessEnv | undefined;

    readonly omxPlayerArgs: OmxPlayerArgs;

    readonly preferredPlayerOrder: MediaPlayerName[];
    readonly logger: ILogger | undefined;

    /**
     * Use a custom logger like e.g. pino.
     * 'console' uses a console logger.
     */
    setLogger( logger: ILogger | 'console' | undefined ): IConfigurePlayer;

    /**
     * Custom configuration for omxplayer
     */
    configureOmxPlayer( omxPlayerArgs: OmxPlayerArgs ): IConfigurePlayer;

    /**
     * Custom environment variables to be used by the player.
     */
    setCustomEnv( env: NodeJS.ProcessEnv ): IConfigurePlayer;

    /**
     * If defined, only the listed players will be checked for availability,
     * and the first one that is available will be used.
     */
    setPreferredOrder( order: MediaPlayerName[] ): IConfigurePlayer;
}
