# AV Player

Starts audio/video files with VLC, mplayer, or omxplayer, whatever is available.

We use this player for our Escape Rooms at [Geheimgang 188](https://geheimgang.ch/).

```typescript
import { AvPlayer } from '@geheimgang188/av-player/dist/src';

const player = new AvPlayer( config => config
        .setPreferredOrder( [ MediaPlayerName.vlc, MediaPlayerName.omxplayer ] )
        .setLogger( 'console' ) );
player.play( 'movie.mp3' ).catch(
        ( err ) => console.error( 'Playback error', err )
);
```

## Notes

`omxplayer` may need a small delay after stopping one video and starting the next one.


## Changelog

* **v1.2.0** (2023-01-19)
  * Changed: Logging for vlc/cvlc improved (less noise, more info)
* **v1.1.0** (2022-08-20): This release focuses on configuration support for
  omxplayer, allowing to specify the output display and audio channel (e.g.
  audio over HDMI or another channel).
  * Added: Custom arguments like `--display` can now be passed to omxplayer
  * Added: Custom environment variables can be passed to video players
  * Changed: A custom logger can now be specified in the configuration. Without
    logger, no output is logged. This avoids log pollution and allows
    integrating logging to a custom logging framework.
  * Fixed: Volume is applied correctly to omxplayer
  * Fixed: Player priority is now respected
* **v0.0.1** (2021-07-15)
  * Initial release, extracted from [raspi-io-server-utils][risu]

[risu]: https://www.npmjs.com/package/raspi-io-server-utils
