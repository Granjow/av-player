# AV Player


Starts audio/video files with VLC, mplayer, or omxplayer, whatever is available.

```typescript
import { AvPlayer } from '@geheimgang188/av-player/dist/src';

const player = new AvPlayer( config => config.setPreferredOrder( [ MediaPlayerName.vlc, MediaPlayerName.omxplayer ] ) );
player.play( 'movie.mp3' ).catch(
        ( err ) => console.error( 'Playback error', err )
);
```


This player is extracted from [raspi-io-server-utils](https://www.npmjs.com/package/raspi-io-server-utils).

## Changelog

* Upcoming
  * Added: Custom arguments like `--display` can now be passed to omxplayer
  * Added: Custom environment variables can be passed to video players
  * Changed: A custom logger can now be specified in the configuration. Without logger, no output is logged.
  * Fixed: Volume is applied correctly to omxplayer
  * Fixed: Player priority is now respected
* **v0.0.1** (2021-07-15)
  * Initial release
