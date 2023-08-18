import { IConfigureFactory } from './ports/i-configure-factory';
import { OmxPlayerArgs } from './specific-players/omx-player';
import { MediaPlayerName } from './media-player-name';
import { ILogger } from '@geheimgang188/i-logger';
import { ConsoleLogger } from './console-logger';
import { VlcPlayerArgs } from './specific-players/vlc-player';

export class FactoryConfig implements IConfigureFactory {

    private _preferredPlayerOrder: MediaPlayerName[] = [ MediaPlayerName.omxplayer, MediaPlayerName.cvlc, MediaPlayerName.mplayer ];
    private _customEnv: NodeJS.ProcessEnv | undefined;
    private _logger: ILogger | undefined;
    private _omxPlayerArgs: OmxPlayerArgs = {
        additionalArgs: [],
    };
    private _vlcPlayerArgs: VlcPlayerArgs = {
        additionalArgs: [],
    };

    get customEnv(): NodeJS.ProcessEnv | undefined {
        return this._customEnv;
    }

    get omxPlayerArgs(): OmxPlayerArgs {
        return this._omxPlayerArgs;
    }

    get vlcPlayerArgs(): VlcPlayerArgs {
        return this._vlcPlayerArgs;
    }

    get preferredPlayerOrder(): MediaPlayerName[] {
        return this._preferredPlayerOrder;
    }

    get logger(): ILogger | undefined {
        return this._logger;
    }

    configureOmxPlayer( omxPlayerArgs: OmxPlayerArgs ): IConfigureFactory {
        this._omxPlayerArgs = omxPlayerArgs;
        return this;
    }

    configureVlcPlayer( vlcPlayerArgs: VlcPlayerArgs ): IConfigureFactory {
        this._vlcPlayerArgs = vlcPlayerArgs;
        return this;
    }

    setCustomEnv( env: NodeJS.ProcessEnv ): IConfigureFactory {
        this._customEnv = env;
        return this;
    }

    setLogger( logger: ILogger | 'console' | undefined ): IConfigureFactory {
        if ( logger === 'console' ) {
            this._logger = new ConsoleLogger();
        } else {
            this._logger = logger;
        }
        return this;
    }

    setPreferredOrder( order: MediaPlayerName[] ): IConfigureFactory {
        this._preferredPlayerOrder = order;
        return this;
    }

}
