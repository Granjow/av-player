import { VrcConf } from 'vrc/dist/src/vrc-conf';
import { AvPlayerFactory } from '../src/av-player-factory';

interface Conf {
    file: string;
}

const conf = new VrcConf<Conf>( 'foo', [
    { name: 'file', type: 'string', dflt: undefined, desc: 'path to the file to play' },
] ).run();

conf.printArgs();

const run = async () => {
    const factory = new AvPlayerFactory( {} );
    const player = await factory.createPlayer();
    player.play( conf.conf.file )
        .catch( err => console.error( err ) );
};

run()
    .catch( err => console.error( err ) );
