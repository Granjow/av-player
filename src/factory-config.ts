import { IConfigureFactory } from './ports/i-configure-factory';
import { OmxPlayerArgs } from './specific-players/omx-player';
import { IConfigurePlayer } from './ports/i-configure-player';
import { MediaPlayerName } from './media-player-name';
import { ILogger } from '@geheimgang188/i-logger';
import { ConsoleLogger } from './console-logger';

export class FactoryConfig implements IConfigureFactory {

    private _preferredPlayerOrder: MediaPlayerName[] = [ MediaPlayerName.omxplayer, MediaPlayerName.cvlc, MediaPlayerName.mplayer ];
    private _customEnv: NodeJS.ProcessEnv | undefined;
    private _logger: ILogger | undefined;
    private _omxPlayerArgs: OmxPlayerArgs = {
        additionalArgs: [],
    }

    get customEnv(): NodeJS.ProcessEnv | undefined {
        return this._customEnv;
    }

    get omxPlayerArgs(): OmxPlayerArgs {
        return this._omxPlayerArgs;
    }

    get preferredPlayerOrder(): MediaPlayerName[] {
        return this._preferredPlayerOrder;
    }

    get logger(): ILogger | undefined {
        return this._logger;
    }

    configureOmxPlayer( omxPlayerArgs: OmxPlayerArgs ): IConfigurePlayer {
        this._omxPlayerArgs = omxPlayerArgs;
        return this;
    }

    setCustomEnv( env: NodeJS.ProcessEnv ): IConfigurePlayer {
        this._customEnv = env;
        return this;
    }

    setLogger( logger: ILogger | 'console' | undefined ): IConfigurePlayer {
        if ( logger === 'console' ) {
            this._logger = new ConsoleLogger();
        } else {
            this._logger = logger;
        }
        return this;
    }

    setPreferredOrder( order: MediaPlayerName[] ): IConfigurePlayer {
        this._preferredPlayerOrder = order;
        return this;
    }

}
