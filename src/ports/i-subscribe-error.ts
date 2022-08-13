export interface ISubscribeError {
    onError( cb: ( error: Error ) => void, once?: boolean ): void;
}
