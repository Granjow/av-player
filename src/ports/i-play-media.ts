import { ISubscribePlaybackState } from './i-subscribe-playback-state';
import { ISubscribeError } from './i-subscribe-error';

export interface PlayOptions {
    loop: boolean;
}

export interface IPlayMedia extends ISubscribePlaybackState, ISubscribeError {
    /**
     * Start playing the given file. The promise resolves when playback started
     * or rejects if an error occurred.
     */
    play( filePath: string, playOptions?: PlayOptions ): Promise<void>;

    /**
     * Stops playback.
     */
    stop(): Promise<void>;

    volume: number;

    readonly running: boolean;

    readonly playerName: string;
}
