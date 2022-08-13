import { OmxPlayerArgs } from '../specific-players/omx-player';

export interface IConfigurePlayer {

    /**
     * Custom environment variables to be used by the player.
     */
    setCustomEnv( env: NodeJS.ProcessEnv ): void;
}
