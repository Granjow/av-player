# AV Player


Starts audio/video files with VLC, mplayer, or omxplayer, whatever is available.

```typescript
import { AvPlayer } from '@geheimgang188/av-player';

const player = new AvPlayer( [ 'vlc', 'omxplayer' ] );
player.play( 'movie.mp3' ).catch(
    ( err ) => console.error( 'Playback error', err )
);
```


This player is extracted from [raspi-io-server-utils](https://www.npmjs.com/package/raspi-io-server-utils).

## Changelog

### v0.1.0

Initial release.
