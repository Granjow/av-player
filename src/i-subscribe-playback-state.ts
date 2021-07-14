export interface ISubscribePlaybackState {
    onPlaybackState( cb: ( running: boolean ) => void, once?: boolean ): void;
}
