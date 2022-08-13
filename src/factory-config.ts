import { IConfigureFactory } from './ports/i-configure-factory';
import { OmxPlayerArgs } from './specific-players/omx-player';
import { IConfigurePlayer } from './ports/i-configure-player';
import { MediaPlayerName } from './media-player-name';

export class FactoryConfig implements IConfigureFactory {

    private _preferredPlayerOrder: MediaPlayerName[] = [ MediaPlayerName.omxplayer, MediaPlayerName.cvlc, MediaPlayerName.mplayer ];
    private _customEnv: NodeJS.ProcessEnv | undefined;
    private _omxPlayerArgs: OmxPlayerArgs = {
        additionalArgs: [],
    }

    get customEnv(): NodeJS.ProcessEnv | undefined {
        return this._customEnv;
    }

    get omxPlayerArgs(): OmxPlayerArgs {
        return this._omxPlayerArgs;
    }

    configureOmxPlayer( omxPlayerArgs: OmxPlayerArgs ): IConfigurePlayer {
        this._omxPlayerArgs = omxPlayerArgs;
        return this;
    }

    setCustomEnv( env: NodeJS.ProcessEnv ): IConfigurePlayer {
        this._customEnv = env;
        return this;
    }

    get preferredPlayerOrder(): MediaPlayerName[] {
        return this._preferredPlayerOrder;
    }

    setPreferredOrder( order: MediaPlayerName[] ): IConfigurePlayer {
        this._preferredPlayerOrder = order;
        return this;
    }

}
